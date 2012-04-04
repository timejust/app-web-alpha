require Rails.root.join('app', 'models', 'o_auth_helper')
require 'google/api_client'

class User
  include Mongoid::Document

  field :email, type: String
  field :token, type: String
  field :refresh_token, type: String
  field :token_expires_at, type: Time
  field :expired, type: Integer, default: 0
  field :issued_at, type: Integer
  field :calendar_color, type: String  
  
  embeds_many :shared_calendars, class_name: "Calendar"
  has_many :events
  has_many :favorite_locations
  index([[ :email, Mongo::ASCENDING ]])
  
  attr :access_token_cache  
  cattr_accessor :google_api_client
  cattr_accessor :google_calendar
  
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable, :omniauthable,
  # :database_authenticatable, :registerable, :recoverable, :rememberable, :trackable, :validatable
  devise :omniauthable, :token_authenticatable, :rememberable

  after_create :reset_authentication_token!

  def set_google_api_client(client)
    self.google_api_client = client
    self.token = self.google_api_client.authorization.access_token
    self.refresh_token = self.google_api_client.authorization.refresh_token
    self.expired = self.google_api_client.authorization.expires_in
    self.issued_at = self.google_api_client.authorization.issued_at
    self.save
    
    self.google_calendar = self.google_api_client.discovered_api('calendar', 'v3')
    # Rails.logger.info "set attr accessory api client: #{self}, #{self.google_api_client}"
  end
  
  def calendar
    if self.google_calendar.nil?
      self.google_calendar = self.google_api_client.discovered_api('calendar', 'v3')
    end
    self.google_calendar
  end
  
  def google_client
    raise UserException::HasNotAuthorizedApplication unless self.has_authorized?
    # Rails.logger.info "google_client: api client: #{self}, #{self.google_api_client}"
    
    if self.google_api_client.nil?
      client = Google::APIClient.new  
      client.authorization.client_id = configatron.gapps.oauth.for_gmail.consumer_key
      client.authorization.client_secret = configatron.gapps.oauth.for_gmail.consumer_secret      
      client.authorization.update_token!({:refresh_token => self.refresh_token,
                                          :access_token => self.token,
                                          :expires_in => self.expired,
                                          :issued_at => Time.at(self.issued_at)
                                          })
      self.google_api_client = client
    end
    if self.google_api_client.authorization.expired?
      self.google_api_client.authorization.fetch_access_token!
      self.token = self.google_api_client.authorization.access_token
      self.refresh_token = self.google_api_client.authorization.refresh_token
      self.expired = self.google_api_client.authorization.expires_in
      self.issued_at = self.google_api_client.authorization.issued_at
      self.save
      self.google_calendar = self.google_api_client.discovered_api('calendar', 'v3')
    end
    self.google_api_client
  end    
  
  # Find or create user for openid authentication
  # Search for User with email equal to data["user_info"]["email"]
  #
  # @param [Hash]   data, hash returned by Google Openid
  # @param [User]   signed_in_resource, current logged in user
  #
  # @return [User]  the User found or created
  #
  def self.find_for_openid(data, signed_in_resource=nil)
    if user = User.first(conditions: {email: data["user_info"]["email"]})
      user
    else # Create a user with a stub password.
      User.create!(email: data["user_info"]["email"], password: Devise.friendly_token[0,20])
    end
  end

  # Is the user has authorized Application to access his calendar
  #
  # @return [Boolean]
  #
  def has_authorized?
    self.token.present?
  end

  # Return and OAuth2::AccessToken to perform queries on Googla Data API
  #
  # @return [OAuth2::AccessToken]
  #
  def access_token
    raise UserException::HasNotAuthorizedApplication unless self.has_authorized?
    
    if access_token_cache.nil?
      access_token_cache = OAuth2::AccessToken.new(
        OAuthHelper.client,
        token,
        refresh_token,
        token_expires_at.to_i - Time.now.to_i
      )
    end
    if access_token_cache.expired?
      access_token_cache = OAuthHelper.client.web_server.refresh_access_token(access_token_cache.refresh_token)
      self.token = access_token_cache.token
      self.refresh_token = access_token_cache.refresh_token
      self.token_expires_at = access_token_cache.expires_at
      self.save
    end
    access_token_cache
  end

  def lightenColor(color)
    lightened = color
    if color[0] == '#' and color.length == 7
      r = [255, (color[1, 2].hex + 32)].min
      g = [255, (color[3, 2].hex + 32)].min
      b = [255, (color[5, 2].hex + 32)].min
      lightened = r.to_s(16) + g.to_s(16) + b.to_s(16)      
    end        
    lightened
  end
  
  def google_calendar_sync
    events = Google::Events.list(self.google_client, self.calendar, email)
    Rails.logger.info("#{JSON.dump(events)}")    
  end
  
  # Create all needed calendars.
  #
  # Search for calendars with configured names.
  # If not found, create it.
  # If calendar found but has wrong color, update it
  #
  def find_or_create_calendars
    calendars = Google::CalendarList.list(self.google_client, self.calendar)
    # Rails.logger.debug(calendars.inspect)  
    
    # Iterate through calendar list and find out primary calendar.
    #calendars['data']['items'].each do |c|            
    #  Rails.logger.info (c.inspect)
    #  if c['title'] == self.email
    #    # If primary calendar is found, set the color of primary calendar
    #    self.calendar_color = lightenColor(c['color'])        
    #    self.save
    #    break              
    #  end
    #end
    #        
    
    # Check if the current user has required calendars in his calendar list.
    User.shared_calendars_properties.each do |properties|
      # Rails.logger.info "Search for calendar named : #{properties[:name]}"
      if calendars != nil
        calendar = calendars.select{|calendar| calendar.summary == properties[:name]}
        calendar = calendar.first
        # Rails.logger.info(calendar.inspect)
        # If not, create shared calendar for our travel information
        unless calendar
          Rails.logger.info "create calendar #{properties[:name]}"  
          calendar = {
            'timeZone' => 'Europe/Paris',
            'location' => 'Paris',
            'summary' => properties[:name],
            'description' => "#{properties[:name]} Timejust Calendar for #{self.email}",
          }
          calendar = Google::Calendars.insert(self.google_client, self.calendar, calendar)        
        end      
      end
            
      # Rails.logger.info "calendar => #{calendar.inspect}"
      # Rails.logger.info "calendar found : #{calendar['summary'].inspect}"
      # Rails.logger.info "calendar has color : #{calendar['colorId'].inspect}"
      if calendar['colorId'] == nil or calendar['colorId'] != properties[:color_id]
        Rails.logger.info "calendar has wrong color, update it with #{properties[:color_id]}"
        calendar['colorId'] = properties[:color_id]
        calendar['selected'] = true
        calendar = Google::CalendarList.update(self.google_client, self.calendar, calendar)
      end
      
      # Rails.logger.info "calendar => #{calendar}"
      local_calendar = self.shared_calendars.find_or_create_by(name: properties[:name],
                                                               color: properties[:color])
      local_calendar.update_attributes(google_short_id: Google::Calendar.extract_google_id(calendar['id']),
                                       google_id: calendar['id'],
                                       color_id: properties[:color_id])
      # Rails.logger.info "local calendar : #{local_calendar.inspect}"
    end
  end

  # Destroy shared calendar
  #
  def destroy_shared_calendars
    calendar_ids = Google::Calendar.list(self.access_token)['data']['items'].map{|cal| cal['id']}
    self.shared_calendars.each do |calendar|
      if calendar_ids.include?(calendar.google_id)
        Google::Calendar.destroy(self.access_token, calendar.google_short_id)
      end
    end
    self.shared_calendars.destroy_all
  end


  # Return Google Shared Calendars to create on shadow calendar for each user
  #
  # @return [Array]
  #
  def self.shared_calendars_properties
    configatron.shared_calendars.to_hash.values
  end

  # Is this user has pending events
  #
  # A pending event is an event which was not totally performed
  #
  # @return [Boolean]
  #
  def has_pending_events?
    self.events.any?{|e| e.pending? }
  end

  # Get the last pending event
  #
  # @return [Event]
  #
  def last_pending_event
    pending_events = self.events.select{|e| e.pending? }.delete_if {|x| x[:created_at] == nil}
    pending_events.sort{|a,b| a[:created_at] <=> b[:created_at]}.last
  end

  # Purge all google event created on user calendars
  def purge_travels    
    TravelStep.where(state: :waiting, user_id: self.id).each do |travel_step|
      #Rails.logger.info 'google_event_id: #{travel_step.google_event_id}, google_calendar_id: #{travel_step.google_calendar_id}'
      begin
        travel_step.destroy
      rescue Exception => e
        Rails.logger.error(e)
      end
    end
  end

end

module UserException
  class HasNotAuthorizedApplication < Exception
  end
end

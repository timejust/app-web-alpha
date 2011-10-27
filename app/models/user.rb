require Rails.root.join('app', 'models', 'o_auth_helper')

class User
  include Mongoid::Document

  field :email, type: String
  field :token, type: String
  field :refresh_token, type: String
  field :token_expires_at, type: Time

  embeds_many :shared_calendars, class_name: "Calendar"
  has_many :events
  has_many :favorite_locations

  attr :access_token_cache

  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable, :omniauthable,
  # :database_authenticatable, :registerable, :recoverable, :rememberable, :trackable, :validatable
  devise :omniauthable, :token_authenticatable, :rememberable

  after_create :reset_authentication_token!

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

  # Create all needed calendars.
  #
  # Search for calendars with configured names.
  # If not found, create it.
  # If calendar found but has wrong color, update it
  #
  # TODO
  #  * refacto : split in methods
  #
  def find_or_create_calendars
    calendars = Google::Calendar.list(self.access_token)
    if !calendars['error'] && calendars['data']['items']
      calendars = calendars['data']['items']
      User.shared_calendars_properties.each do |properties|
        Rails.logger.info "Search for calendar named : #{properties[:name]}"
        calendar = calendars.select{|calendar| calendar['title'] == properties[:name]}
        calendar = calendar.first
        unless calendar
          Rails.logger.info "create calendar #{properties[:name]} with color #{properties[:color]}"
          calendar = Google::Calendar.create(
            self.access_token,
            {
              title: properties[:name],
              description: "#{properties[:name]} Timejust Calendar for #{self.email}",
              color: properties[:color],
              selected: true
            }
          )
          calendar = calendar['data']
        else
          Rails.logger.info "calendar found : #{calendar['title'].inspect}"
          Rails.logger.info "calendar must have color : #{properties[:color].inspect}"
          Rails.logger.info "calendar have color : #{calendar['color'].inspect}"
          if calendar['color'] != properties[:color]
            calendar_short_id = Google::Calendar.extract_google_id(calendar['id'])
            Rails.logger.info "calendar has wrong color, update it"
            Google::Calendar.update(
              self.access_token,
              calendar_short_id,
              {
                selected: true,
                color: properties[:color]
              }
            )
          end
        end
        local_calendar = self.shared_calendars.find_or_create_by(
          name: properties[:name],
          color: properties[:color]
        )
        local_calendar.update_attributes(
          google_short_id: Google::Calendar.extract_google_id(calendar['id']),
          google_id: calendar['id']
        )
        Rails.logger.info "local calendar : #{local_calendar.inspect}"
      end
    else
      JSON.parse(calendars)
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
    self.events.select{|e| e.pending? }.sort{|a,b| a[:created_at] <=> b[:created_at]}.last
  end

  # Purge all google event created on user calendars
  def purge_travels
    TravelStep.where(state: :waiting, user_id: self.id).each do |travel_step|
      travel_step.destroy
    end
  end

end

module UserException
  class HasNotAuthorizedApplication < Exception
  end
end

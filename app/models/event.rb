# encoding: utf-8
class Event
  include Mongoid::Document

  belongs_to :user
  has_many :travels

  # Around events relations
  belongs_to :event
  has_many :around_events, class_name: "Event"

  field :google_id,           type: String
  field :google_calendar_id,  type: String
  field :title,               type: String
  field :details,             type: String
  field :location,            type: String
  field :start_time,          type: Time
  field :end_time,            type: Time
  field :state,               type: String
  field :created_at,          type: Time
  field :before_start_time,   type: Integer, default: 10
  field :after_end_time,      type: Integer, default: 15
  field :base,                type: String, default: "arrival"
  field :timezone,            type: String
  
  # travels propositions
  embeds_many :previous_travel_nodes, as: :previous_travel_nodes,  class_name: "TravelNode", :order => :weight.desc
  embeds_many :current_travel_nodes,  as: :current_travel_nodes,   class_name: "TravelNode", :order => :weight.desc
  #embeds_many :next_travel_nodes,     as: :next_travel_nodes,      class_name: "TravelNode", :order => :weight.desc
  
  # travel nodes confirmed by user
  embeds_one :previous_travel_node,   as: :previous_travel_node,   class_name: "TravelNode"
  embeds_one :current_travel_node,    as: :current_travel_node,    class_name: "TravelNode"
  #embeds_one :next_travel_node,       as: :next_travel_node,       class_name: "TravelNode"

  validates_presence_of :user
  validates_presence_of :start_time
  validates_presence_of :end_time

  # don't send event to worklers if this is an around event
  after_create :push_to_worker, unless: "self.event.present?"

  @ip = ""
  
  state_machine initial: :waiting do
    # waiting for workers to search for travel nodes proposals
    state :waiting
    # workers are searching for travel nodes proposals
    state :travel_nodes_progress
    # workers have finish searching travel nodes proposals and are waiting for user confirmation
    state :travel_nodes_done
    # Waiting for workers to search travel proposals
    state :travels_waiting
    # workers are searching travel proposals
    state :travels_progress
    # waiting for resquet task to write travels to calendar
    state :travels_to_calendar_waiting
    # workers have finish travel proposals
    state :travels_done
    # nothing to do with this event anymore
    state :canceled
    # worker set this event has fail
    state :error

    after_transition any => :waiting, :do => :push_to_worker

    event :wait do
      transition all => :waiting
    end

    event :cancel do
      transition all => :canceled
    end

    event :error do
      transition all => :error
    end
  end

  # Set ip address where the request from
  def set_current_ip(ip)
    @ip = ip
  end
  
  # Is this event is pending
  #
  # A pending event is an event with was not totally performed
  #
  # @return [Boolean]
  def pending?
    !self.canceled?
  end

  # Parse an event from Google calendar
  #
  # @param [JSON]   event_json, Event json hash from Google calendar
  #
  # @return [Event]
  #
  def self.parse_from_google_gadget(event_json)
    event = JSON.parse(event_json)
    start_time = Time.new(
      event['startTime']['year'],
      event['startTime']['month'],
      event['startTime']['date'],
      event['startTime']['hour'],
      event['startTime']['minute'],
      event['startTime']['second']
    )
    end_time = Time.new(
      event['endTime']['year'],
      event['endTime']['month'],
      event['endTime']['date'],
      event['endTime']['hour'],
      event['endTime']['minute'],
      event['endTime']['second']
    )
    tz = Timejust::TimeWithTimezone.new(event['timezone'], start_time)
    start_time = tz.utc_time()    
    tz = Timejust::TimeWithTimezone.new(event['timezone'], end_time)
    end_time = tz.utc_time()
    
    Event.new(
      title: event['title'],
      location: event['location'],
      google_calendar_id: event['owner']['email'],
      start_time: start_time,
      end_time: end_time,
      before_start_time: event['before_start_time'],
      after_end_time: event['after_end_time'],
      timezone: event['timezone']
    )        
  end

  def self.parse_from_google_data(event)
    events = []
    if event['when']
      event['when'].each do |dates|
        events << Event.new(
          title: event['title'],
          location: event['location'],
          google_calendar_id: event['creator']['email'],
          google_id: event['id'],
          start_time: dates['start'],
          end_time: dates['end']
        )
      end
    end
    events
  end

  # Get event informations from google api
  #
  # when need to search by date range, because google gadget
  # cannot send GData event id directly :(
  #
  # @param [OAuth2::AccessToken]  access_token
  #
  def add_google_info(access_token)
    if self.google_id.blank?
      if self.start_time.present? && self.title.present?
        google_event = Google::Event.search_by_date_range(
          access_token,
          self.start_time,
          (self.start_time + 1.minutes),
          self.google_calendar_id
        )
        if !google_event['error'] && items = google_event['data']['items']
          event = items.select{|item| item['title'] == self.title}.first
          if event
            self.details = event['details']
            self.google_id = event['id']
          end
        end
      end
    end
  end

  # Check if any previous/current/next travel node has a title to create
  # favorite location for this user
  def check_for_favorite_locations
    if self.previous_travel_node && self.previous_travel_node.title.present?
      FavoriteLocation.create_from_travel_node(self.user, self.previous_travel_node)
    end
    if self.current_travel_node && self.current_travel_node.title.present?
      FavoriteLocation.create_from_travel_node(self.user, self.current_travel_node)
    end
    #if self.next_travel_node && self.next_travel_node.title.present?
    #  FavoriteLocation.create_from_travel_node(self.user, self.next_travel_node)
    #end
  end

  # Write travels events to Google Calendar
  #
  def write_travels_to_calendar
    self.travels.each do |travel|
      calendar = self.user.shared_calendars.where(name: travel.calendar).first
      if calendar
        travel.write_travel_steps_to_calendar(calendar)
      end
    end
  end

  def as_json(options = {})
    options ||= {}
    options[:include] ||= []
    options[:include] << :travels
    super(
      include: {
        travels: {
          include: :travel_steps
        }
      }
    )
  end

  # Is all travel nodes are confirmed by user
  #
  # @return [Boolean]
  def travel_nodes_confirmed?
    self.previous_travel_node.present? &&
    self.previous_travel_node.confirmed? &&
    self.current_travel_node.present? &&
    self.current_travel_node.confirmed? #&&
    # self.next_travel_node.present? &&
    # self.next_travel_node.confirmed?
  end

  # Normalize all travel nodes associated with this event
  def normalize_travel_nodes(request_ip)
    #[:previous, :current, :next].each do |type|
    [:previous, :current].each do |type|
      proposals = "#{type.to_s}_travel_nodes"
      selected = "#{type.to_s}_travel_node"

      # normalize all travel nodes proposals
      self.send(proposals).each do |travel_node|
        travel_node.normalize(request_ip)
      end

      # if an address has been submitted by user
      if self.send(selected)
        # Normalize user submitted addresses
        self.send(selected).normalize(request_ip)
      end
    end
  end

  # Add all normalized travel nodes to proposals
  def add_normalized_to_proposals_travel_nodes
    #[:previous, :current, :next].each do |type|
    previous_event_num = 0
    current_event_num = 0
    previous_selected_num = 0
    current_selected_num = 0    
    previous_event = nil
    current_event = nil
    previous_normalized = nil
    current_normalized = nil
    
    [:previous, :current].each do |type|
      proposals = "#{type.to_s}_travel_nodes"
      selected = "#{type.to_s}_travel_node"
      
      # For each travel node proposals
      travel_nodes = self.send(proposals).dup
      travel_nodes.each_with_index do |travel_node, index|
        # If this travel node is not confirmed
        if travel_node.unconfirmed?
          travel_node.normalized_addresses.each do |normalized_address|
            if travel_node.tag == 'event_location'
              if type.to_s == 'previous'
                previous_event_num += 1
                previous_event = travel_node
                previous_normalized = normalized_address
              else
                current_event_num += 1
                current_event = travel_node
                current_normalized = normalized_address
              end              
            end
            self.add_travel_node_proposal(type, 
                normalized_address.formatted_address, 
                normalized_address.lat,
                normalized_address.lng,
                travel_node)
          end
          travel_node.destroy
        end
      end
      
      # For user submitted unconfirmed travel node, add each normalized proposals
      selected_node = self.send(selected)
      selected_node.update_attribute(:weight, 200) if selected_node
      if selected_node && selected_node.unconfirmed?
        selected_node.normalized_addresses.each do |normalized_address|
          if type == 'previous'
            previous_selected_num += 1
          else
            current_selected_num += 1
          end          
          self.add_travel_node_proposal(type, 
              normalized_address.formatted_address, 
              normalized_address.lat,
              normalized_address.lng,
              selected_node)
        end
      end
    end
  end
  
  # Add confirmed travel_node to proposals with a big weight
  #
  def add_confirmed_travel_node_to_proposals
    #[:previous, :current, :next].each do |type|
    [:previous, :current].each do |type|
      selected = "#{type.to_s}_travel_node"

      # For user submitted unconfirmed travel node, add each normalized proposals
      selected_node = self.send(selected)
      if selected_node && selected_node.confirmed?
        selected_node.update_attribute(:weight, 500)
        selected_node.add_google_info(self)
        self.add_travel_node_proposal(type, selected_node.address, 
            selected_node.lat, selected_node.lng, selected_node)
      end
    end
  end

  # Add a travel node proposal
  #
  # @param  [String]      type of travel node in previous, current, next
  # @param  [String]      address, the address to submit
  # @param  [TravelNode]  related travel node
  #
  def add_travel_node_proposal(type, address, lat, lng, travel_node)
    self.send("#{type.to_s}_travel_nodes").create(
      address: address,
      title: travel_node.title,
      weight: travel_node.weight,
      tag: travel_node.tag,
      lat: lat,
      lng: lng,
      has_normalized: 1,
      event_title: travel_node.event_title,
      event_start_time: travel_node.event_start_time,
      event_end_time: travel_node.event_end_time,
      event_location: travel_node.event_location,
      event_google_id: travel_node.event_google_id
    )
  end

  ##
  # @param [Fixnum] estimated_time
  # @param [Time] start time
  # @return [Time] the forward Time departure
  def forward_departure(estimated_time=0, date=nil)
    (date || self.start_time) - estimated_time - self.before_start_time.minutes
  end

  ##
  # @param [Fixnum] estimated_time
  # @param [Time] start time
  # @return [Time] the forward Time arrival
  def forward_arrival(estimated_time=0, date=nil)
    (date || self.start_time) - self.before_start_time.minutes
  end

  ##
  # @param [Fixnum] estimated_time
  # @param [Time] end time
  # @return [Time] the backward Time departure
  def backward_departure(estimated_time=0, date=nil)
    (date || self.end_time) + self.after_end_time.minutes
  end

  ##
  # @param [Fixnum] estimated_time
  # @param [Time] end time
  # @return [Time] the backward Time arrival
  def backward_arrival(estimated_time=0, date=nil)
    (date || self.end_time) + estimated_time + self.after_end_time.minutes
  end

  # Return all events around the current one
  #
  # @param  [Integer]   offset, num of days to search for events
  #
  # @return  [Array]    Collection of Event
  #
  def fetch_around_events(offset = 1)
    google_events = Google::Event.search_by_date_range(
      self.user.access_token,
      (self.start_time - offset.to_i.days).at_beginning_of_day,
      (self.end_time + offset.to_i.days).end_of_day,
      self.google_calendar_id
    )
    events = []
    if google_events && !google_events['error'] && google_events['data']['totalResults'].to_i > 0
      self.around_events.delete_all
      google_events['data']['items'].each do |event|
        events = events | Event.parse_from_google_data(event)
      end
      events.each do |e|
        e.user = self.user
        self.around_events << e
      end
      self.save
    end
    self.around_events
  end

  # Get the last located event before the current one
  #
  def previous_events
    self.around_events.select{|event|
      event.location.present? && event.end_time < self.start_time
    }.sort{|a,b| a.end_time <=> b.end_time}
  end

  # Get the first located event after the current one
  #
  def next_events
    self.around_events.select{|event|
      event.location.present? && event.start_time > self.end_time
    }.sort{|a,b| a.start_time <=> b.start_time}
  end

  # Parse all travel nodes to find favorite
  #
  def extract_favorite_locations_from_addresses
    #[:previous, :current, :next].each do |type|
    [:previous, :current].each do |type|
      proposals = "#{type}_travel_nodes"
      selected = "#{type}_travel_node"

      # For each travel node proposals
      self.send(proposals).each_with_index do |travel_node, index|
        if travel_node.address.present? &&
          favorite = self.user.favorite_locations.where(title: travel_node.address.strip).first
          travel_node.update_attributes(
            address: favorite.address
          )
        end
      end

      # For user submitted travel nodes
      if self.send(selected) && self.send(selected).address.present? &&
        favorite = self.user.favorite_locations.where(title: self.send(selected).address.strip).first
        self.send(selected).update_attributes(
          title: favorite.title,
          address: favorite.address
        )
      end
    end
  end

  # Geo location data is important to get valid result from geo service so 
  # we clean up position information if there is invalid character or information.
  def cleanupPosition(position)
    if position == nil or position == "null"
      position = 0
    end
    position
  end
  
  #
  # @param mode [String] type of transporataion
  # @param direction 
  # @return neccesary parameters for timejust geo direction services
  def itinerary(key, mode)
    origin_travel = nil
    destination_travel = nil
    time = 0
    origin_travel = self.previous_travel_node
    destination_travel = self.current_travel_node 
    
    if self.base == "arrival"
      time = self.forward_arrival
    else
      time = self.backward_departure
    end
   
    { :id => key.to_s,
      :origin => "#{cleanupPosition(origin_travel.lat)},#{cleanupPosition(origin_travel.lng)}", 
      :destination => "#{cleanupPosition(destination_travel.lat)},#{cleanupPosition(destination_travel.lng)}", 
      :time => time.to_i.to_s, 
      :mode => mode,
      :base => self.base }
  end
  
  ##
  # @param [String] RATP travetype see RATP::Itinerary initialize
  # @return [RATP::Itinerary]
  def ratp_itinerary_forward(traveltype='plus_rapide')
    query = {
      :type1 => 'adresse',
      :type2 => 'adresse',
      :traveltype => traveltype,
    }
    query = query.merge(:proxy => configatron.ratp_proxy.url) if configatron.ratp_proxy.url.present?
    RATP::Itinerary.new({:datestart => 'false', # Arrivée à
                        :datedate => self.forward_arrival.strftime('%Y%m%d%H%M'),
                        :name1 => self.previous_travel_node.address.unistrip,
                        :name2 => self.current_travel_node.address.unistrip}.merge(query))
  end

  ##
  # @param [String] RATP travetype see RATP::Itinerary initialize
  # @return [RATP::Itinerary]
  def ratp_itinerary_backward(traveltype='plus_rapide')
    query = {
      :type1 => 'adresse',
      :type2 => 'adresse',
      :traveltype => traveltype,
    }
    query = query.merge(:proxy => configatron.ratp_proxy.url) if configatron.ratp_proxy.url.present?
    RATP::Itinerary.new({:datestart => 'true', # Départ à
                        :datedate => self.backward_departure.strftime('%Y%m%d%H%M'),
                        :traveltype => traveltype,
                        :name1 => self.current_travel_node.address.unistrip,
                        :name2 => self.next_travel_node.address.unistrip}.merge(query))
  end

  # Ugly code to remove duplicate travels errors for the same provider
  #
  def remove_duplicate_provider_errors
    provider_errors = []
    self.travels.each do |travel|
      if travel.travel_steps.present? && !travel.travel_steps.any?{|travel_step| travel_step.state != 'error'}
        if provider_errors.include?(travel.provider)
          travel.destroy
        end
        provider_errors << travel.provider
      end
    end
  end

  protected

  def push_to_worker
    Resque.enqueue(EventInitial, self.id.to_s, @ip)
  end
end

require 'tzinfo'

# encoding: utf-8
class Travel
  include Mongoid::Document

  belongs_to :event
  belongs_to :user
  has_many :travel_steps, :dependent => :destroy
  field :state,        type: String
  field :travel_mode,  type: Symbol
  field :calendar,     type: String
  field :provider,     type: String
  field :transports,   type: Array, default: []
  field :primary_calendar_color, type: String
  
  @@shared_calendars = configatron.shared_calendars.to_hash
  cattr_reader :shared_calendars
  @@max_travel_hours = 12.hours

  validates_presence_of :user, :event, :provider
  validates_inclusion_of :travel_mode, :in => @@shared_calendars.keys
  validates_inclusion_of :calendar, :in => @@shared_calendars.values.map{|v| v[:name] }, :allow_nil => true

  state_machine initial: :waiting do
    # waiting for user confirmation
    state :waiting
    # bookmarked by user, keep it in shared calendar
    state :bookmarked
    # confirmed by user, store in his personnal calendar
    state :confirmed
    before_transition any => all, do |travel, transition|
      travel.travel_steps.each do |travel_step|
        travel_step.send(transition.event)
      end
    end
    event :confirm do
      transition [:waiting, :bookmarked] => :confirmed
    end
    event :bookmark do
      transition [:waiting] => :bookmarked
    end
  end

  # Write travels to Google Calendar
  #
  def write_travel_steps_to_calendar(calendar = nil, id)
    self.primary_calendar_color = user.calendar_color
    
    # TODO not_in(state: ['error'])
    self.travel_steps.each do |travel_step|
      # Rails.logger.info calendar.inspect
      # Before create something, delete if already exists
      #travel_step.destroy_google_event_when(calendar.google_event_id, )
      if calendar == nil
        travel_step.create_google_event(user.email, user.email, id) unless travel_step.error?
      else
        travel_step.create_google_event(calendar.google_short_id, calendar.name, id) unless travel_step.error?
      end
    end
  end

  def ratp_init_time(estimated_time=0, direction=:forward)
    start_time = event.send("#{direction}_departure", estimated_time)
    end_time = event.send("#{direction}_arrival", estimated_time)
    if direction == :forward
      init_time = start_time
    else
      init_time = end_time
    end
  end

  # This below is temporary function. It can be ugly :)
  def to_formatted_text(dir) 
    if dir["text_direction"] == ""
      departure_time = DateTime.strptime(dir["dep_time"], "%Y-%m-%d %H:%M:%S").to_time
      arrival_time = DateTime.strptime(dir["arr_time"], "%Y-%m-%d %H:%M:%S").to_time
      line = dir["line"]
      if dir["line"] == "base" || dir["line"] == "connections" 
        line = "walk" 
      end      
      headsign = dir["headsign"]
      if line == "walk"
        headsign = ((arrival_time.to_i - departure_time.to_i) / 60).to_s + " min" 
      end
      
      dir["dep_name"] + " (" + departure_time.strftime("%H:%M") + ") > (" + 
        line + " " + headsign +") > " + dir["arr_name"] + " (" + 
        arrival_time.strftime("%H:%M") + ")"
    else
      dir["text_direction"]
    end
  end
  
  def create_travel_step(travel, mode, direction=:forward, departure, arrival)  
    self.update_attributes(transports: [mode])
    if mode == "train"
      mode = "rail"
    end
    
    # if return status is not ok, we cannot create a step.
    if travel["status"] == "ok"
      trip = travel["trip"]
      format = "%Y-%m-%d %H:%M:%S"      
      tz = TZInfo::Timezone.get(event['timezone'])
            
      if trip["arr_time"] != "" && trip["dep_time"] != ""        
        arrival_time = tz.utc_to_local(DateTime.strptime(trip["arr_time"], format).to_time)
        departure_time = tz.utc_to_local(DateTime.strptime(trip["dep_time"], format).to_time)                
        estimated_time = arrival_time.to_i - departure_time.to_i
      else
        # If arrival time and departure time are not provided, we have to 
        # calculate either arrival time or departure time based on the time 
        # from event schedule with the given duration => we need to implement
        # duration in direction response <= *******
        arrival_time = departure_time = estimated_time = 0
      end
          
      steps = []    
      distance = 0
      trip["steps"].each do |step|
        step["directions"].each do |dir|
          dir["arr_time"] = tz.utc_to_local(DateTime.strptime(dir["arr_time"], format)).to_s
          dir["dep_time"] = tz.utc_to_local(DateTime.strptime(dir["dep_time"], format)).to_s
          distance += dir["distance"]
          steps.push(dir)
        end
      end
      
      travel_step_param = {
        event_id: event.id,
        user_id: event.user.id,
        provider: 'timejust',
        public_url: "",
        api_url: configatron.service.url + "/" + configatron.service.geo_direction,
        estimated_time: (estimated_time / 60).round,
        departure_time: departure_time,
        arrival_time: arrival_time,
        distance: (distance.to_f / 1000).to_f.round(2).to_s,
        state: 'waiting',
        travel_type: direction,
        steps: steps,
        steps_count: (steps.size - 1),
        summary: [mode],
        departure: departure,
        arrival: arrival
      }                          
      
      #unless estimated_time.between?(1, @@max_travel_hours)
      #  travel_step_param.merge!(state: 'error')
      #end      
    else
      travel_step_param = {
        event_id: event.id,
        user_id: event.user.id,
        provider: 'timejust',
        public_url: "",
        api_url: configatron.service.url + "/" + configatron.service.geo_direction,
        state: 'error',
        summary: [mode],
        travel_type: direction 
      }
    end
  
    self.travel_steps.create(travel_step_param)    
  end
end

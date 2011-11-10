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
  def write_travel_steps_to_calendar(calendar)
    # TODO not_in(state: ['error'])
    self.travel_steps.each do |travel_step|
      travel_step.create_google_event(calendar.google_short_id, calendar.name) unless travel_step.error?
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

  ##
  # @param [Event]
  # @param [RATP::Itinerary]
  # @param [Symbol] :forward or :backward
  # @return [TravelStep]
  def create_ratp_travel_step(itinerary, direction=:forward)
    estimated_time = itinerary.duration.seconds
    departure_time, arrival_time = nil, nil
    if itinerary.valid? && itinerary.departure_hour.present?
      departure_time = Time.parse(itinerary.departure_hour, ratp_init_time(estimated_time, direction))
      arrival_time = departure_time + estimated_time
    end
    travel_step_param = {
      event_id: event.id,
      user_id: event.user.id,
      provider: 'ratp',
      public_url: itinerary.url,
      api_url: itinerary.url,
      estimated_time: (itinerary.duration / 60),
      departure_time: departure_time,
      arrival_time: arrival_time,
      state: 'waiting',
      travel_type: direction,
      steps: itinerary.travel_formated,
      steps_count: (itinerary.steps_count - 1),
      summary: itinerary.summary.reject(&:blank?),
    }
    if estimated_time.between?(1, @@max_travel_hours) && itinerary.valid?
      # transports
      self.update_attributes(transports: itinerary.transports.reject(&:blank?))
    else
      travel_step_param.merge!(state: 'error')
    end
    Rails.logger.info('#INFO travel_step_param RATP: ' + travel_step_param.inspect)
    self.travel_steps.create(travel_step_param)
  end

  ##
  # @param [Event]
  # @param [GoogleDirections]
  # @param [Symbol] :forward or :backward
  # @return [TravelStep]
  def create_google_travel_step(itinerary, direction=:forward)
    # google only do car
    self.update_attributes(transports: %w{car})

    estimated_time = itinerary.drive_time_in_minutes.to_i.minutes
    travel_step_param = {
      event_id: event.id,
      user_id: event.user.id,
      provider: 'google-directions',
      api_url: itinerary.xml_call,
      public_url: itinerary.public_url,
      estimated_time: itinerary.drive_time_in_minutes.to_i,
      departure_time: event.send("#{direction}_departure", estimated_time),
      arrival_time: event.send("#{direction}_arrival", estimated_time),
      distance: itinerary.distance_text,
      state: 'waiting',
      travel_type: direction,
      steps: itinerary.steps.map{|s| Sanitize.clean(s) },
      summary: %w{car},
    }
    unless estimated_time.between?(1, @@max_travel_hours)
      travel_step_param.merge!(state: 'error')
    end
    self.travel_steps.create(travel_step_param)
  end
end

# encoding: utf-8

include ActionView::Helpers::SanitizeHelper

class TravelStep
  include Mongoid::Document

  belongs_to :event
  belongs_to :user
  belongs_to :travel
  field :provider,            type: String
  field :departure_time,      type: Time
  field :arrival_time,        type: Time
  field :distance,            type: String
  field :estimated_time,      type: Integer
  field :steps,               type: Array
  field :google_event_id,     type: String
  field :google_calendar_id,  type: String
  field :state,               type: String
  field :api_url,             type: String
  field :public_url,          type: String
  field :travel_type,         type: String
  field :calendar,            type: String
  field :steps_count,         type: Integer
  field :summary,             type: Array, default: []

  # not validates_presence_of :departure_time, :arrival_time because we need to
  # save the step with error state
  validates_presence_of :event, :user, :travel, :provider, :travel_type
  validates_inclusion_of :travel_type, :in => %w{forward backward}

  before_destroy :destroy_google_event
  after_destroy :destroy_travel

  state_machine initial: :waiting do
    # waiting for user confirmation
    state :waiting
    # bookmarked by user, keep it in shared calendar
    state :bookmarked
    # confirmed by user, store in his personnal calendar
    state :confirmed
    # step is not valid
    state :error

    before_transition any => :confirmed, :do => :confirm_step
    after_transition any => :bookmarked, :do => :destroy_other_proposals

    event :confirm do
      transition [:waiting, :bookmarked] => :confirmed
    end
    event :bookmark do
      transition [:waiting] => :bookmarked
    end
  end

  # Confirm a travel step
  #
  # first destroy google event proposal, then create event
  # on user calendar.
  # Also destroy all travel_step for the current travel and travel_type
  #
  def confirm_step
    self.destroy_google_event
    self.send_invitation_by_mail
    self.destroy_other_proposals
  end

  # Destroy all proposal with same travel and travel_type
  #
  def destroy_other_proposals
    TravelStep.where(
      event_id: self.event.id,
      travel_type: self.travel_type
    ).each do |travel_step|
      travel_step.destroy if travel_step.travel != self.travel
    end
  end

  # Create event(s) from travel
  def create_google_event(calendar_id, calendar_name = nil)
    google_event = Google::Event.create(self.event.user.access_token, calendar_id,
      {
        title: self.summary.join('-'),
        details: self.google_event_detail,
        transparency: "opaque",
        status: "confirmed",
        location: self.invitation_location,
        when: [
          {
            start: self.departure_time.utc.iso8601,
            end: self.arrival_time.utc.iso8601
          }
        ]
      }
    )
    if !google_event['error'] && google_event['data']
      self.google_event_id = google_event['data']['id']
      self.google_calendar_id = calendar_id
      self.calendar = calendar_name
      self.save
    end
  end

  def google_event_detail
    if self.steps
      <<-EOS
#{self.public_url}
#{self.steps.join('
')}
      EOS
    else
      "no details"
    end
  end

  # Generate a ics string for this travel step
  #
  # @return   [String]
  def to_ics
    cal = Icalendar::Calendar.new
    event = Icalendar::Event.new
    event.start         = self.departure_time.utc.iso8601.gsub(/[-:]/, '')
    event.end           = self.arrival_time.utc.iso8601.gsub(/[-:]/, '')
    event.summary       = "#{self.invitation_title}"
    event.organizer     = %w(mailto:plan@timejust.com)
    event.description   = strip_tags(self.google_event_detail).gsub('&nbsp;', ' ')
    event.location      = self.invitation_location
    #event.attendees     = %w(mailto:plan@timejust.com)
    event.add_attendee "#{self.user.email}", {"PARTSTAT" => "ACCEPTED", "RSVP=FALSE" => "FALSE"} 
    event.status        = 'CONFIRMED'
    event.transp        = 'OPAQUE'
    event.created       = Time.now.utc.iso8601.gsub(/[-:]/, '')
    cal.ip_method       = 'REQUEST'
    cal.add_event(event)
    cal.to_ical
  end

  # Return the invitation title
  #
  # @return [String]
  #
  def invitation_subject
    if self.travel_type == 'forward'
      "Timejust invitation for travel to #{self.event.title} on #{I18n.l(self.departure_time, :format => :date)}"
    else
      "Timejust invitation for travel from #{self.event.title} on #{I18n.l(self.departure_time, :format => :date)}"
    end
  end

  def invitation_title
    summary.join('-') if summary.present?
  end

  # Return the invitation location
  #
  # @return [String]
  #
  def invitation_location
    if self.travel_type == 'forward'
      self.event.previous_travel_node.address
    else
      self.event.current_travel_node.address
    end
  end

  # Send invitation for this travel step by ics
  #
  def send_invitation_by_mail
    TravelStepMailer.invitation(self).deliver
  end

  protected

  # Destroy all associated google events
  def destroy_google_event
    if self.google_event_id && self.google_calendar_id
      Google::Event.destroy(
        self.event.user.access_token,
        self.google_calendar_id,
        self.google_event_id
      )
    end
  end

  # Destroy associated travel if there is no more travels
  # steps associated
  def destroy_travel
    self.travel.reload
    self.travel.destroy if self.travel.travel_steps.empty?
  end

end

# encoding: UTF-8
class TravelNode
  include Mongoid::Document

  field :address,           type: String
  field :title,             type: String
  field :state,             type: String
  field :weight,            type: Integer
  field :tag,               type: String
  field :event_title,       type: String
  field :event_start_time,  type: Time
  field :event_end_time,    type: Time
  field :event_location,    type: String
  field :event_google_id,   type: String
  embedded_in :event

  embeds_many :normalized_addresses

  validates_presence_of :address

  state_machine initial: :unconfirmed do
    state :confirmed
  end

  def normalize
    Timejust::NormalizeAddresses.new(self) if self.unconfirmed?
  end

  # Get event informations from google api
  #
  def add_google_info(related_event)
    unless self.event_google_id.blank?
      google_event = Event.where(google_id: self.event_google_id, event_id: related_event.id).first
      if google_event
        self.update_attributes(
          event_title: google_event.title,
          event_start_time: google_event.start_time,
          event_end_time: google_event.end_time,
          event_location: google_event.location
        )
      end
    end
  end
end

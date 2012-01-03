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
  field :has_normalized,    type: Integer, default: 0
  field :lat,               type: Float,   default: 0.0
  field :lng,               type: Float,   default: 0.0
  
  embedded_in :event

  embeds_many :normalized_addresses

  validates_presence_of :address

  state_machine initial: :unconfirmed do
    state :confirmed
  end

  def normalize(ip)
    Rails.logger.info "** TravelNode: normalize #{self.address} from #{ip} - already normalized ? #{self.has_normalized}"
    # Even it's unconfirmed, if the given address has already normalized, 
    # we don't go through normalization process.
    if self.has_normalized == 0
      Timejust::NormalizeAddresses.new(self, ip) if self.unconfirmed?
    end
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

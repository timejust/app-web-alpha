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
  field :formatted_address, type: Integer, default: 0
  
  embedded_in :event

  embeds_many :normalized_addresses

  validates_presence_of :address

  state_machine initial: :unconfirmed do
    state :confirmed
  end

  def normalize(ip)
    Rails.logger.info "normalize #{self.address} from #{ip} - #{self.formatted_address}"
    #if self.formatted_address == 1
    #Rails.logger.info "we do not normalize for #{self.address} from #{ip} - #{self.formatted_address}"
      
      # If the address came from google geo code, we skip to normalize it
      #norm = self.normalized_addresses.find_or_initialize_by(formatted_address: self.address)
      #norm.save      
    #else
    Timejust::NormalizeAddresses.new(self, ip) if self.unconfirmed?
    #end
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

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
  # TODO spec
  #
  def add_google_info(access_token, calendar_id)
    unless self.event_google_id.blank?
      google_event = Google::Event.get(
        access_token,
        calendar_id,
        self.event_google_id
      )
      $stderr.puts google_event.inspect
      if google_event && !google_event['error']
        self.update_attributes(
          event_title: google_event['data']['title'],
          event_start_time: google_event['data']['when'][0]['start'],
          event_end_time: google_event['data']['when'][0]['end'],
          event_location: google_event['data']['location']
        )
      end
    end
  end
end

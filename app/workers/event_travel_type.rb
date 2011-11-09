# encoding: UTF-8
class EventTravelType
  @queue = :event_travel_type

  def self.perform(event_id)
    Timejust::LatencySniffer.new('Resque:EventTravelType:enqueue', event_id, 'ended')
    Timejust::LatencySniffer.new('Event:EventTravelType', event_id, 'started')
    event = Event.first(conditions: {id: event_id})
    unless event.previous_travel_nodes.blank? &&
      event.current_travel_nodes.blank? &&
      event.next_travel_nodes.blank?

      event.update_attributes('travel_type' => 'local', 'state' => 'travels_progress')

      Timejust::LatencySniffer.new('Resque:EventApiProvider:enqueue', event_id, 'started')      
      Resque.enqueue(EventApiProvider, event_id)
      Timejust::LatencySniffer.new('Event:EventTravelType', event_id, 'ended')
    else
      Rails.logger.info " * No travel nodes confirmations found for #{event_id}"
    end
  end
end

# encoding: UTF-8
class EventApiProvider
  @queue = :event_api_provider

  def self.perform(event_id)
    Timejust::LatencySniffer.new('Event:EventApiProvider', event_id, 'perform')
    event = Event.first(conditions: {id: event_id})

    event.update_attributes('applicable_travel_api' => ['ratp', 'google-directions'])

    Timejust::LatencySniffer.new('Event:EventAbstractApiProvider', event_id, 'enqueue')
    Resque.enqueue(EventAbstractApiProvider, event_id)
  end
end

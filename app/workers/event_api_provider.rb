# encoding: UTF-8
class EventApiProvider
  @queue = :event_api_provider

  def self.perform(event_id)
    #Timejust::LatencySniffer.new('Resque:EventApiProvider:enqueue', event_id, 'ended')
    timer = Timejust::LatencySniffer.new('Event:EventApiProvider')
    timer.start
    event = Event.first(conditions: {id: event_id})

    event.update_attributes('applicable_travel_api' => ['ratp', 'google-directions'])

    #Timejust::LatencySniffer.new('Resque:EventAbstractApiProvider:enqueue', event_id, 'started')
    Resque.enqueue(EventAbstractApiProvider, event_id)
    timer.end
  end
end

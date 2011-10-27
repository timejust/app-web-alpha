# encoding: UTF-8
class EventApiProvider
  @queue = :event_api_provider

  def self.perform(event_id)
    event = Event.first(conditions: {id: event_id})

    event.update_attributes('applicable_travel_api' => ['ratp', 'google-directions'])

    Resque.enqueue(EventAbstractApiProvider, event_id)
  end
end

# encoding: UTF-8

class EventNormalizer
  @queue = :event_normalizer

  def self.perform(event_id)
    Timejust::LatencySniffer.new('Event:EventNormalizer', event_id, 'perform')
    event = Event.first(conditions: {id: event_id})

    event.normalize_travel_nodes
    event.add_normalized_to_proposals_travel_nodes

    if event.travel_nodes_confirmed?
      event.update_attribute(:state, 'travels_waiting')
      
      Timejust::LatencySniffer.new('Event:EventTravelType', event_id, 'enqueue')
      Resque.enqueue(EventTravelType, event_id)
    else
      event.update_attribute(:state, 'travel_nodes_done')
    end
  end
end

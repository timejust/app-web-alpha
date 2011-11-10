# encoding: UTF-8

class EventNormalizer
  @queue = :event_normalizer

  def self.perform(event_id)
    #Timejust::LatencySniffer.new('Resque:EventNormalizer:enqueue', event_id, 'ended')
    timer = Timejust::LatencySniffer.new('Event:EventNormalizer')
    timer.start()
    
    event = Event.first(conditions: {id: event_id})

    event.normalize_travel_nodes
    event.add_normalized_to_proposals_travel_nodes

    if event.travel_nodes_confirmed?
      event.update_attribute(:state, 'travels_waiting')
            
      #Timejust::LatencySniffer.new('Resque:EventTravelType:enqueue', event_id, 'started')
      Resque.enqueue(EventTravelType, event_id)
    else
      event.update_attribute(:state, 'travel_nodes_done')
    end
    timer.end()
  end
end

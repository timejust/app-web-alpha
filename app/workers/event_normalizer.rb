# encoding: UTF-8

class EventNormalizer
  @queue = :event_normalizer

  def self.perform(event_id, ip)
    timer = Timejust::LatencySniffer.new('Event:EventNormalizer')
    timer.start()
    
    etimer = Timejust::LatencySniffer.new('Task:MongoSingleEventQuery')
    gtimer = Timejust::LatencySniffer.new('Task:GoogleNormalize')
    
    etimer.start
    event = Event.first(conditions: {id: event_id})
    etimer.end
    
    gtimer.start
    event.normalize_travel_nodes(ip)
    event.add_normalized_to_proposals_travel_nodes
    gtimer.end
    
    if event.travel_nodes_confirmed?
      event.update_attribute(:state, 'travels_waiting')
            
      Resque.enqueue(EventTravelType, event_id)
    else
      event.update_attribute(:state, 'travel_nodes_done')
    end
    timer.end()
  end
end

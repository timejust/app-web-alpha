# encoding: UTF-8
require 'ratp/itinerary'
require 'google_directions'
require 'ostruct'

class EventAbstractApiProvider
  @queue = :event_abstract_api_provider

  def self.perform(event_id)
    timer = Timejust::LatencySniffer.new('Event:EventAbstractApiProvider')
    timer.start
    event = Event.first(conditions: {id: event_id})

    direction = Timejust::GeoDirection.new()
    i = 0    
    direction_map = {}    
    
    ["bus", "train", "car"].each do |mode| 
      itinerary_backward = OpenStruct.new
      itinerary_forward = OpenStruct.new
      travel = Travel.create(event_id: event.id,
                             user_id: event.user.id,
                             travel_mode: mode,
                             provider: 'timejust',
                             state: 'waiting')
                             
      direction.push_itinerary(event.itinerary(i, mode, :forward))
      direction.push_itinerary(event.itinerary(i + 1, mode, :backward))
      
      itinerary_forward.travel = travel
      itinerary_forward.direction = :forward
      itinerary_forward.mode = mode
      itinerary_backward.travel = travel
      itinerary_backward.direction = :backward
      itinerary_backward.mode = mode
      
      direction_map[i.to_s] = itinerary_forward
      direction_map[(i + 1).to_s] = itinerary_backward
      i += 2
    end
    
    # run timejust direction service client
    direction.run()
    travels = direction.results() 
    if travels != ""
      travels.each do |travel|
        # travel has only one key now but in order to get key variable, 
        # we need to iterate through
        travel.each_key do |key|
          trip = travel[key]
          itinerary = direction_map[key]        
          direction = itinerary.direction
          mode = itinerary.mode
          
          itinerary.travel.create_travel_step(trip, mode, direction)        
        end
      end
    end
    
    Resque.enqueue(EventTravelSorter, event_id)
    timer.end
  end
end

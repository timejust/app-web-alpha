# encoding: UTF-8
#require 'ratp/itinerary'
#require 'google_directions'
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
    #["car"].each do |mode| 
      #itinerary_backward = OpenStruct.new
      itinerary = OpenStruct.new
      travel = Travel.create(event_id: event.id,
                             user_id: event.user.id,
                             travel_mode: mode,
                             provider: 'timejust',
                             state: 'waiting')
                             
      direction.push_itinerary(event.itinerary(i, mode))      
      itinerary.travel = travel
      itinerary.direction = :forward
      itinerary.mode = mode      
      direction_map[i.to_s] = itinerary
      i += 1
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
          
          itinerary.travel.create_travel_step(trip, mode, direction, 
            event.previous_travel_node.address, event.current_travel_node.address)        
        end              
      end
    end
    
    Resque.enqueue(EventTravelSorter, event_id)
    timer.end
  end
end

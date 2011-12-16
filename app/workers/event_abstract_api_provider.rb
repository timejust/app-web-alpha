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
    
    # We are going to use new service 
    # RATP
    # create a worker
    #[{:public_transport_faster => 'plus_rapide'}, {:public_transport_minimum_change => 'minimum_de_changement'}].each do |ratp_params|
    #  ratp_param = ratp_params.values.first
    #
    #  ratp = Travel.create(event_id: event.id,
    #                       user_id: event.user.id,
    #                       travel_mode: ratp_params.keys.first,
    #                       provider: 'ratp',
    #                       state: 'waiting')
    #
    #  # departure
    #  ratp_forward = event.ratp_itinerary_forward(ratp_param)
    #  ratp.create_ratp_travel_step(ratp_forward, :forward)
    #
    #  # arrival
    #  ratp_backward = event.ratp_itinerary_backward(ratp_param)
    #  ratp.create_ratp_travel_step(ratp_backward, :backward)
    #end
    #
    #rtimer.end
    #
    #gtimer = Timejust::LatencySniffer.new('Task:GoogleDirection')
    #gtimer.start
    #
    ## GOOGLE
    #google = Travel.create(event_id: event.id,
    #                       user_id: event.user.id,
    #                       travel_mode: :car,
    #                       provider: 'google-directions',
    #                       state: 'waiting')
    #
    ## departure
    #google_dir_dep = GoogleDirections.new(event.previous_travel_node.address, event.current_travel_node.address)
    #google.create_google_travel_step(google_dir_dep, :forward)
    #
    ## arrival
    #google_dir_arr = GoogleDirections.new(event.current_travel_node.address, event.next_travel_node.address)
    #google.create_google_travel_step(google_dir_arr, :backward)
    #
    #gtimer.end
    
    Resque.enqueue(EventTravelSorter, event_id)
    timer.end
  end
end

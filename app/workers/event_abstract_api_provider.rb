# encoding: UTF-8
require 'ratp/itinerary'
require 'google_directions'

class EventAbstractApiProvider
  @queue = :event_abstract_api_provider

  def self.perform(event_id)
    timer = Timejust::LatencySniffer.new('Event:EventAbstractApiProvider')
    timer.start
    event = Event.first(conditions: {id: event_id})

    rtimer = Timejust::LatencySniffer.new('Task:Timejust:Location')
    rtimer.start       
    
    # We are going to use new service 
    # RATP
    # create a worker
    [{:public_transport_faster => 'plus_rapide'}, {:public_transport_minimum_change => 'minimum_de_changement'}].each do |ratp_params|
      ratp_param = ratp_params.values.first
    
      ratp = Travel.create(event_id: event.id,
                           user_id: event.user.id,
                           travel_mode: ratp_params.keys.first,
                           provider: 'ratp',
                           state: 'waiting')
    
      # departure
      ratp_forward = event.ratp_itinerary_forward(ratp_param)
      ratp.create_ratp_travel_step(ratp_forward, :forward)
    
      # arrival
      ratp_backward = event.ratp_itinerary_backward(ratp_param)
      ratp.create_ratp_travel_step(ratp_backward, :backward)
    end
    
    rtimer.end
    
    gtimer = Timejust::LatencySniffer.new('Task:GoogleDirection')
    gtimer.start
    
    # GOOGLE
    google = Travel.create(event_id: event.id,
                           user_id: event.user.id,
                           travel_mode: :car,
                           provider: 'google-directions',
                           state: 'waiting')
    
    # departure
    google_dir_dep = GoogleDirections.new(event.previous_travel_node.address, event.current_travel_node.address)
    google.create_google_travel_step(google_dir_dep, :forward)
    
    # arrival
    google_dir_arr = GoogleDirections.new(event.current_travel_node.address, event.next_travel_node.address)
    google.create_google_travel_step(google_dir_arr, :backward)
    
    gtimer.end
    
    Resque.enqueue(EventTravelSorter, event_id)
    timer.end
  end
end

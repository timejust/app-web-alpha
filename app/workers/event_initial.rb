# encoding: UTF-8
class EventInitial
  @queue = :event_initial

  def self.perform(event_id, ip)    
    timer = Timejust::LatencySniffer.new('Event:EventInitial')
    timer.start()
    
    etimer = Timejust::LatencySniffer.new('Task:MongoSingleEventQuery')
    utimer = Timejust::LatencySniffer.new('Task:MongoSingleUserQuery')
    gtimer = Timejust::LatencySniffer.new('Task:AddGoogleInfo')
    
    etimer.start
    event = Event.first(conditions: {id: event_id})
    etimer.end
    return unless event.waiting?

    utimer.start
    user = User.first(conditions: {id: event.user_id})
    utimer.end
    
    gtimer.start
    event.add_google_info(user.access_token)
    gtimer.end

    # event.update_attribute(:state, "travel_nodes_progress")
    # Resque.enqueue(EventTravelNodeSelector, event_id, ip)
    # event.update_attribute(:state, 'travels_waiting')            
    # Resque.enqueue(EventTravelType, event_id)
    #event.update_attributes('travel_type' => 'local', 'state' => 'travels_progress')
    #Resque.enqueue(EventApiProvider, event_id)
    event.update_attributes('travel_type' => 'local', 'state' => 'travels_progress')
    event.update_attributes('applicable_travel_api' => ['ratp', 'google-directions', 'timejust'])
    Resque.enqueue(EventAbstractApiProvider, event_id) 
    timer.end()
  #rescue Exception => e
  #  Rails.logger.error e
  #  event.error
  #  $stderr.puts e
  end
end

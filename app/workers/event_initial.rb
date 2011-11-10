# encoding: UTF-8
class EventInitial
  @queue = :event_initial

  def self.perform(event_id)
    #Timejust::LatencySniffer.new('Resque:EventInitial:enqueue', event_id, 'ended')
    timer = Timejust::LatencySniffer.new('Event:EventInitial')
    timer.start()
    
    event = Event.first(conditions: {id: event_id})
    return unless event.waiting?

    user = User.first(conditions: {id: event.user_id})

    event.add_google_info(user.access_token)

    event.update_attribute(:state, "travel_nodes_progress")

    #Timejust::LatencySniffer.new('Resque:EventTravelNodeSelector:enqueue', event_id, 'started')
    Resque.enqueue(EventTravelNodeSelector, event_id)
    timer.end()
  rescue Exception => e
    Rails.logger.error e
    event.error
    $stderr.puts e
  end
end

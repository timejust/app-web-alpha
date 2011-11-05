# encoding: UTF-8
class EventInitial
  @queue = :event_initial

  def self.perform(event_id)
    Rails.logger.info "event_initial called****************"
    
    event = Event.first(conditions: {id: event_id})
    return unless event.waiting?

    user = User.first(conditions: {id: event.user_id})

    event.add_google_info(user.access_token)

    event.update_attribute(:state, "travel_nodes_progress")

    Resque.enqueue(EventTravelNodeSelector, event_id)
  rescue Exception => e
    event.error
    $stderr.puts e
  end
end

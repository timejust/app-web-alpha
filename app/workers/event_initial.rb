# encoding: UTF-8
class EventInitial
  @queue = :event_initial
  @user = nil
  
  def self.perform(event_id, ip)    
    event = Event.first(conditions: {id: event_id})
    return unless event.waiting?

    @user = User.first(conditions: {id: event.user_id})    
    #event.add_google_info(@user.access_token)

    event.update_attributes('travel_type' => 'local', 'state' => 'travels_progress')
    event.update_attributes('applicable_travel_api' => ['ratp', 'google-directions', 'timejust'])
    Resque.enqueue(EventAbstractApiProvider, event_id) 
  rescue OAuth2::Error => e
    @user.update_attributes(:expired => 1)    
    event.update_attribute(:state, 'error')
  end
end

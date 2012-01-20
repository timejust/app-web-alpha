# encoding: UTF-8
class EventSaver
  @queue = :event_saver
  @user = nil
  # Ping api for write on user calendar
  #def self.write_travels_to_calendar(event_id, user)
    #url = configatron.api.url + "/events/#{event_id}/write_travels_to_calendar"
    #opts = {
      #:timeout => 2000,
      #:params => {:auth_token => user.authentication_token},
    #}
    #if configatron.api.htaccess.present?
      #opts.merge!(:username => configatron.api.htaccess.username,
                  #:password => configatron.api.htaccess.password)
    #end
    #res = Typhoeus::Request.post(url, opts)
  #end

  def self.perform(event_id)    
    timer = Timejust::LatencySniffer.new('Event:EventSaver')
    timer.start()
    
    event = Event.first(conditions: {id: event_id})       
    @user = User.first(conditions: {id: event.user_id})

    event.remove_duplicate_provider_errors

    ctimer = Timejust::LatencySniffer.new('Task:TravelToGoogleCalendar')
    ctimer.start()
    
    event.write_travels_to_calendar
    
    ctimer.end()        
    timer.end()
  rescue OAuth2::HTTPError => e
    @user.update_attributes(
      :expired => 1
    )    
  end
end

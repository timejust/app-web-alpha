# encoding: UTF-8
class EventSaver
  @queue = :event_saver

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
    #Timejust::LatencySniffer.new('Resque:EventSaver:enqueue', event_id, 'ended')
    timer = Timejust::LatencySniffer.new('Event:EventSaver')
    timer.start()
    
    etimer = Timejust::LatencySniffer.new('Task:MongoSingleEventQuery')
    utimer = Timejust::LatencySniffer.new('Task:MongoSingleUserQuery')
    etimer.start()
    event = Event.first(conditions: {id: event_id})
    etimer.end()
       
    utimer.start()
    user = User.first(conditions: {id: event.user_id})
    utimer.end()

    event.remove_duplicate_provider_errors

    ctimer = Timejust::LatencySniffer.new('Task:TravelToGoogleCalendar')
    ctimer.start()
    event.write_travels_to_calendar
    ctimer.end()
        
    timer.end()
  end
end

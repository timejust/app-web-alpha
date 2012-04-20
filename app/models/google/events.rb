class Google::Events
  def self.list(client, service, calendar_id)
    result = client.execute(:api_method => service.events.list,                          
                            :parameters => {'calendarId' => calendar_id})
    return nil if result.response.status != 200
    page_token = nil
    event_list = Array.new
    
    while true
      event_list = event_list | result.data.items
      # If there is more data to fetch, let's get them.
      if !(page_token = result.data.next_page_token)
        break
      end
      result = client.execute(:api_method => service.events.list, 
                              :parameters => {'calendarId' => calendar_id, 
                                              'pageToken' => page_token})      
    end
    event_list
  end
end
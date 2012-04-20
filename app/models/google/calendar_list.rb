# encoding: utf-8
class Google::CalendarList

  def self.list(client, service)
    result = client.execute(service.calendar_list.list)
    return nil if result.response.status != 200
    page_token = nil
    calendar_list = Array.new
  
    while true
      calendar_list = calendar_list | result.data.items
      # If there is more data to fetch, let's get them.
      if !(page_token = result.data.next_page_token)
        break
      end
      result = client.execute(service.calendar_list.list, 
                              {'pageToken' => page_token})      
    end
    calendar_list
  end    
  
  def self.update(client, service, calendar)
    result = client.execute(:api_method => service.calendar_list.update,
                            :parameters => {'calendarId' => calendar.id},
                            :body_object => calendar,
                            :headers => {'Content-Type' => 'application/json'})
    return nil if result.response.status != 200
    result.data                            
  end
  
  def self.insert(client, service, calendar)
    result = client.execute(:api_method => service.calendar_list.insert,
                            :body => JSON.dump(calendar),
                            :headers => {'Content-Type' => 'application/json'})
    return nil if result.response.status != 200
    result.data    
  end
  
end
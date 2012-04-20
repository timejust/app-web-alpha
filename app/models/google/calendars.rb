# encoding: utf-8
class Google::Calendars
  def self.insert(client, service, calendar)
    result = client.execute(:api_method => service.calendars.insert,
                            :body => JSON.dump(calendar),
                            :headers => {'Content-Type' => 'application/json'})
    #Rails.logger.info result.response.body.inspect      
    return nil if result.response.status != 200
    result.data    
  end
  
  def self.get(client, service, calendar_id)
    result = client.execute(:api_method => service.calendars.get,
                            :parameters => {'calendarId' => calendar_id})
    return nil if result.response.status != 200
    result.data
  end  
end

require 'yajl/json_gem'

module CalendarsStub extend WebMock
  def self.stub_sync(email, token, type)
    resp_body = '{"status":"ok"}'
    body = {
      "calendar-type" => type,
      "refresh-token" => token
      }
    resp = stub_request(:post, "http://service-staging.timejust.com/v1/calendars/#{email}/sync").
      with(:body => JSON.generate(body), 
           :headers => {'Content-Type: application/json;charset=utf-8'=>''}).
      to_return(:status => 200, :body => resp_body, :headers => {})
    
    status = resp.response.status[0]
    message = JSON.parse(resp.response.body)["status"]
    
    if status == 200 and message == 'ok'
      Timejust::OK.new(message)
    end
  end
  
  def self.stub_sync_with_invalid_token(email, token, type)
    resp_body = '{"status":"not_found","reason":"token not found"}'
    body = {
      "calendar-type" => type,
      "refresh-token" => token
      }
    resp = stub_request(:post, "http://service-staging.timejust.com/v1/calendars/#{email}/sync").
      with(:body => JSON.generate(body), 
           :headers => {'Content-Type: application/json;charset=utf-8'=>''}).
      to_return(:status => 200, :body => resp_body, :headers => {})
    
    status = resp.response.status[0]
    message = JSON.parse(resp.response.body)["status"]
    
    if status == 200 and message == 'not_found'
      Timejust::ERROR.new(Timejust::Service::NOT_FOUND, message)
    end
  end
  
  def self.stub_sync_with_invalid_calendar(email, token, type)
    resp_body = '{"status":"bad_request","results":""}'
    body = {
      "calendar-type" => type,
      "refresh-token" => token
      }
    resp = stub_request(:post, "http://service-staging.timejust.com/v1/calendars/#{email}/sync").
      with(:body => JSON.generate(body), 
           :headers => {'Content-Type: application/json;charset=utf-8'=>''}).
      to_return(:status => 200, :body => resp_body, :headers => {})
    
    status = resp.response.status[0]
    message = JSON.parse(resp.response.body)["status"]
    
    if status == 200 and message == 'bad_request'
      Timejust::ERROR.new(Timejust::Service::BAD_REQUEST, message)
    end
  end
  
  def self.stub_insert_event(event, token, type)
    resp_body = '{"status":"ok","event":""}'
    body = {
      "calendar-type" => type,
      "refresh-token" => token,
      "event" => {
        "calendarId" => event['calendar_id'],
        "start" => event['start'],
        "end" => event['end'],
        "position" => {
          "lat" => event['lat'],
          "lng" => event['lng']
          },
        "location" => event['location'],
        "summary" => event['summary'],
        "description" => event['description']
      }
    }
    resp = stub_request(:post, "http://service-staging.timejust.com/v1/calendars/#{event["calendar_id"]}/events").
      with(:body => JSON.generate(body), 
           :headers => {'Content-Type: application/json;charset=utf-8'=>''}).
      to_return(:status => 200, :body => resp_body, :headers => {})
    
    status = resp.response.status[0]
    message = JSON.parse(resp.response.body)["status"]
    
    if status == 200 and message == 'ok'
      Timejust::OK.new(message)
    end
  end
  
end
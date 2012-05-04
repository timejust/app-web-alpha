# encoding: UTF-8
require 'cgi'
require 'yajl/json_gem'
require 'utf8proc'
require 'faraday'

module Timejust  
  class Response
    def initialize(status, message)
      @status = status
      @message = message
    end
    
    def status
      @status
    end
    
    def message
      @message
    end
  end
  
  class ERROR < Response
    def initialize(status, message)
      super(status, message)
    end
  end
  
  class OK < Response
    def initialize(message)
      super(Service::OK, message)
    end
  end
    
  class Calendars
    GOOGLE_CALENDAR = "google-calendar"    
    
    EVENT_TRAVEL = "event-travel"
    EVENT_CALENDAR = "event-calendar"
    
    def initialize(email, refresh_token)
      @email = email
      @refresh_token = refresh_token  
      @url = configatron.service.http.url      
    end
    
    # The Faraday connection object
    def connection
      @connection ||= begin
        conn = Faraday.new(:url => @url) do |b|
          b.use Faraday::Request::UrlEncoded  # convert request params as "www-form-urlencoded"
          b.use Faraday::Request::JSON        # encode request params as json
          b.use Faraday::Response::Logger     # log the request to STDOUT
          b.use Faraday::Adapter::NetHttp     # make http requests with Net::HTTP        
        end
        conn
      end
    end
        
    def post_request(url, body)
      puts("Timejust:Calendars.post_request: uri = #{url}")
      puts("Timejust:Calendars.post_request: body = #{JSON.generate(body)}")
      Rails.logger.info("Timejust:Calendars.post_request: uri = #{url}")
      Rails.logger.info("Timejust:Calendars.post_request: body = #{JSON.generate(body)}")

      resp = self.connection.post do |req|
        req.url url
        req.headers['Content-Type'] = 'application/json'
        req.body = JSON.generate(body)
      end      
      
      unless resp.status == 500 and resp.status == 405
        message = JSON.parse(resp.body)["status"]
        status = resp.status
        Rails.logger.info("response => #{status}, #{message}")
        puts("response => #{status}, #{message}")
      
        if status == 200 and message == 'ok'
          OK.new(resp.status)
        else
          ERROR.new(resp.status, message)
        end
      else
        ERROR.new(resp.status, "")
      end      
    rescue JSON::ParserError
      ERROR.new(resp.status, "")
    end
    
    def sync(calendar_type, min = 0, max = 0)            
      body = {
        "calendar-type" => calendar_type,
        "refresh-token" => @refresh_token,
        "time-min" => min.to_i,
        "time-max" => max.to_i
        }

      self.post_request("/#{configatron.service.calendar}/#{@email}/sync", 
                        body)
    end
    
    def insert(calendar_type, event)      
      body = {
        "calendar-type" => calendar_type,
        "refresh-token" => @refresh_token,
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
          "eventType" => event['eventType'],
          "description" => event['description']
        }
      }
      self.post_request("/#{configatron.service.calendar}/#{event["calendar_id"]}/events", 
                        body)                        
    end
    
  end
end

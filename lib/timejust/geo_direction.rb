# encoding: UTF-8
require 'cgi'
require 'yajl/json_gem'
require 'utf8proc'

module Timejust
  class GeoDirection      
    def initialize()  
      @@url = configatron.service.http.url + "/" + configatron.service.geo_direction
      @@params = Array.new()  
      @@results = ""  
    end

    def run()
      hydra = Typhoeus::Hydra.hydra

      json = JSON.generate(@@params)
      req = Typhoeus::Request.new(@@url, :request => :post, :body => json)      
      Rails.logger.info "******************* Direction #{@@url}, #{json}**************"                           
      req.on_complete do |response|
        if response.success? && (data = JSON.parse(response.body))
          if data['status'] == 'ok'          
            @@results = data['results']
          end
        end
      end
      
      hydra.queue req      
      hydra.run
    end
    
    def results()
      @@results
    end
    
    def push_itinerary(itinerary)
      @@params.push(itinerary)
    end
    
    # class methodes
    class << self      
      def url
        @@url
      end
    end
  end
end

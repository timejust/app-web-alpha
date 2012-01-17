# encoding: UTF-8
require 'cgi'
require 'yajl/json_gem'
require 'utf8proc'
require Rails.root.join('lib', 'monkey_patches', 'string')

module Timejust
  class NormalizeAddresses  
    @@url = configatron.service.url + "/" + configatron.service.geo_recognition
    
    def initialize(*nodes, ip)
      hydra = Typhoeus::Hydra.hydra
      nodes.flatten!
      nodes.reject!{|node| node.nil? || node.address.blank?}
      
      i = 1
      geos = Array.new      
      nodes.each do |n|
        if ip == "undefined"
          ip = ""
        end
        geo = {"geo"=>CGI.escape(n.address), "id"=>i.to_s, "src"=>ip}
        geos.push(geo)
        i+=1
      end
      
      json = JSON.generate(geos)
      req = Typhoeus::Request.new(@@url, :request => :post, :body => json)      
      # Rails.logger.info "******************* normalize step01 #{@@url}, #{json}**************"                           
      req.on_complete do |response|
        if response.success? && (data = JSON.parse(response.body))
          if data['status'] == 'ok'          
            i = 1                        
            data['results'].each do |d|
              n = nodes[i - 1]
              # n.normalized_addresses.destroy_all
              if d[i.to_s]['status'] == 'ok'                
                d[i.to_s]['results'].each do |result|         
                  norm = n.normalized_addresses.find_or_initialize_by(
                      formatted_address: result['address'])                  
                  norm.update_attributes(
                      lat: result['location']['lat'],
                      lng: result['location']['lng']
                  )                  
                  norm.save
                end
              end
              i+=1
            end
          end
        end
      end
      
      hydra.queue req      
      hydra.run
    end

    # class methodes
    class << self      
      def url
        @@url
      end
    end
  end
end

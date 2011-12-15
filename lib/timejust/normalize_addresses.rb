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
      
      Rails.logger.info "******************* result step00 **************"                           
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
      
      Rails.logger.info "******************* result step01 **************"                           
      
      json = JSON.generate(geos)
      req = Typhoeus::Request.new(@@url, :request => :post, :body => json)      
      Rails.logger.info "******************* result step02 #{@@url}, #{json}**************"                           
      req.on_complete do |response|
        Rails.logger.info "******************* result step03 **************"                           
        if response.success? && (data = JSON.parse(response.body))
          Rails.logger.info "******************* result step04 **************"                           
          if data['status'] == 'ok'          
            Rails.logger.info "******************* result #{data}**************"                           
            i = 1            
            data['results'].each do |d|
              n = nodes[i-1]
              n.normalized_addresses.destroy_all
              if d[i.to_s]['status'] == 'ok'                
                d[i.to_s]['results'].each do |result|         
                  Rails.logger.info "******************* result from google geocode #{result}, #{result['address']}"                           
                  norm = n.normalized_addresses.find_or_initialize_by(formatted_address: result['address'])
                    #lat: result['location']['lat'],
                    #lng: result['location']['lng'])                  
                  # FIXME : don't destroy old normalized adresses if travel node adress has not changed                  
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
      
      #@@url = "http://maps.google.com/maps/api/geocode/json"
      #@@default_params = {
      #  :region => 'fr',
      #  :language => 'fr',
      #  :sensor => 'false',
      #}
      #nodes.each do |n|
      #  # TODO: Do request only if we dont have data
      #  # remove , and '" google dont like these even escape on the query
      #  address = n.address.gsub('œ', 'oe').unistrip.gsub(/(\s+)?,(\s+)?/, ' ').gsub(/['"]/, ' ')
      #  params = @@default_params.merge(:address => CGI.escape(address))                
      #  
      #  Rails.logger.info "************************* geocode #{params} *****************************"
      #  
      #  req = Typhoeus::Request.new(@@url, :params => params)
      #  req.on_complete do |response|
      #    if response.success? && (data = JSON.parse(response.body))
      #      if data['status'] == 'OK'
      #        # FIXME : don't destroy old normalized adresses if travel node adress has not changed
      #        n.normalized_addresses.destroy_all
      #        data['results'].each do |d|
      #          Rails.logger.info "result from google geocode #{d['formatted_address']}"
      #          norm = n.normalized_addresses.find_or_initialize_by(formatted_address: d['formatted_address'])
      #          norm.update_attributes(d)
      #          norm.save
      #        end
      #      end
      #    end
      #  end
      #  
      #  hydra.queue req
      #end
      #hydra.run
    end

    # class methodes
    class << self
      def default_params
        @@default_params
      end
      def url
        @@url
      end
    end
  end
end

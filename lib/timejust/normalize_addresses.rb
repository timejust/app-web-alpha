# encoding: UTF-8
require 'cgi'
require 'yajl/json_gem'
require 'utf8proc'
require Rails.root.join('lib', 'monkey_patches', 'string')

module Timejust
  class NormalizeAddresses
    @@url = "http://maps.google.com/maps/api/geocode/json"
    @@default_params = {
      :region => 'fr',
      :language => 'fr',
      :sensor => 'false',
    }

    def initialize(*nodes)
      hydra = Typhoeus::Hydra.hydra
      nodes.flatten!
      nodes.reject!{|node| node.nil? || node.address.blank?}
      nodes.each do |n|
        # TODO: Do request only if we dont have data
        # remove , and '" google dont like these even escape on the query
        address = n.address.gsub('œ', 'oe').unistrip.gsub(/(\s+)?,(\s+)?/, ' ').gsub(/['"]/, ' ')
        params = @@default_params.merge(:address => CGI.escape(address))
        req = Typhoeus::Request.new(@@url, :params => params)
        req.on_complete do |response|
          if response.success? && (data = JSON.parse(response.body))
            if data['status'] == 'OK'
              # FIXME : don't destroy old normalized adresses if travel node adress has not changed
              n.normalized_addresses.destroy_all
              data['results'].each do |d|
                norm = n.normalized_addresses.find_or_initialize_by(formatted_address: d['formatted_address'])
                norm.update_attributes(d)
                norm.save
              end
            end
          end
        end
        hydra.queue req
      end
      hydra.run
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

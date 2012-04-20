# encoding: UTF-8
require 'spec_helper'

describe Timejust::NormalizeAddresses do

  # before do
  #   @event = Factory(:event)
  #   @event.current_travel_nodes.create(:address => '15 rue poissonniere 75002')
  # end
  # 
  # it 'should not raise with nil nodes' do
  #   lambda {
  #     Timejust::NormalizeAddresses.new(nil)
  #     Timejust::NormalizeAddresses.new([nil])
  #   }.should_not raise_error
  # end
  # 
  # def do_google_request
  #   hydra = Typhoeus::Hydra.hydra
  # 
  #   file = Rails.root.join('spec', 'mocks', 'mock_google_maps_2results.json')
  # 
  #   params = Timejust::NormalizeAddresses.default_params.merge(:address => CGI.escape('quai de la rapee'))
  #   request = Typhoeus::Request.new(Timejust::NormalizeAddresses.url,
  #                                     :params => params)
  #   response = Typhoeus::Response.new(:code => 200, :headers => "",
  #                                     :body => open(file).read,
  #                                     :time => 0.3)
  #   hydra.stub(:get, /http\:\/\/maps\.google\.com\/maps.*/).and_return(response)
  # 
  # end
  # 
  # it 'should do request for a travel node' do
  #   do_google_request
  # 
  #   # not normalized
  #   @event.current_travel_nodes.each do |c|
  #     c.normalized_addresses.should be_empty
  #   end
  # 
  #   # start normalization
  #   Timejust::NormalizeAddresses.new(@event.current_travel_nodes)
  # 
  #   @event.reload
  #   # normalized
  #   @event.current_travel_nodes.each do |c|
  #     c.normalized_addresses.should_not be_empty
  #     c.normalized_addresses.size.should == 1
  #   end
  # end

end

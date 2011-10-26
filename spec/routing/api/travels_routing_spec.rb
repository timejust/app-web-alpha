# encoding: utf-8
require 'spec_helper'

describe Api::TravelsController do

  let (:travel) {Factory(:travel)}

  it "should route to destroy" do
    api_travel_path(travel).should == "/v1/travels/#{travel.id}"
    {:delete => api_url(api_travel_path(travel))}.should route_to(:controller => 'api/travels', :action => 'destroy', :version => 'v1', :id => travel.id.to_s)
  end

  it "should route to confirm" do
    confirm_api_travel_path(travel).should == "/v1/travels/#{travel.id}/confirm"
    {:put => api_url(confirm_api_travel_path(travel))}.should route_to(:controller => 'api/travels', :action => 'confirm', :version => 'v1', :id => travel.id.to_s)
  end

  it "should route to bookmark" do
    bookmark_api_travel_path(travel).should == "/v1/travels/#{travel.id}/bookmark"
    {:put => api_url(bookmark_api_travel_path(travel))}.should route_to(:controller => 'api/travels', :action => 'bookmark', :version => 'v1', :id => travel.id.to_s)
  end

end

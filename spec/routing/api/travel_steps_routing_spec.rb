# encoding: utf-8
require 'spec_helper'

describe Api::TravelsController do

  let (:travel_step) {Factory(:travel_step)}

  it "should route to destroy" do
    api_travel_step_path(travel_step).should == "/v1/travel_steps/#{travel_step.id}"
    {:delete => api_url(api_travel_step_path(travel_step))}.should route_to(:controller => 'api/travel_steps', :action => 'destroy', :version => 'v1', :id => travel_step.id.to_s)
  end

  it "should route to confirm" do
    confirm_api_travel_step_path(travel_step).should == "/v1/travel_steps/#{travel_step.id}/confirm"
    {:put => api_url(confirm_api_travel_step_path(travel_step))}.should route_to(:controller => 'api/travel_steps', :action => 'confirm', :version => 'v1', :id => travel_step.id.to_s)
  end

  it "should route to bookmark" do
    bookmark_api_travel_step_path(travel_step).should == "/v1/travel_steps/#{travel_step.id}/bookmark"
    {:put => api_url(bookmark_api_travel_step_path(travel_step))}.should route_to(:controller => 'api/travel_steps', :action => 'bookmark', :version => 'v1', :id => travel_step.id.to_s)
  end

end

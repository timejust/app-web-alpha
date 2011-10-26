# encoding: utf-8
require 'spec_helper'

describe Api::EventsController do

  let (:event) {Factory(:event)}

  it "should route to create" do
    api_events_path.should == '/v1/events'
    {:post => api_url(api_events_path)}.should route_to(:controller => 'api/events', :action => 'create', :version => 'v1')
  end

  it "should route to add_google_info" do
    add_google_info_api_event_path(event).should == "/v1/events/#{event.id}/add_google_info"
    {:put => api_url(add_google_info_api_event_path(event))}.should route_to(:controller => 'api/events', :action => 'add_google_info', :version => 'v1', :id => event.id.to_s)
  end

  it "should route to travel_nodes" do
    travel_nodes_api_event_path(event).should == "/v1/events/#{event.id}/travel_nodes"
    {:get => api_url(travel_nodes_api_event_path(event))}.should route_to(:controller => 'api/events', :action => 'travel_nodes', :version => 'v1', :id => event.id.to_s)
  end

  it "should route to travel_nodes_confirmation" do
    travel_nodes_confirmation_api_event_path(event).should == "/v1/events/#{event.id}/travel_nodes_confirmation"
    {:post => api_url(travel_nodes_confirmation_api_event_path(event))}.should route_to(:controller => 'api/events', :action => 'travel_nodes_confirmation', :version => 'v1', :id => event.id.to_s)
  end

  it "should route to travels" do
    travels_api_event_path(event).should == "/v1/events/#{event.id}/travels"
    {:get => api_url(travels_api_event_path(event))}.should route_to(:controller => 'api/events', :action => 'travels', :version => 'v1', :id => event.id.to_s)
  end

  it "should route to write_travels_to_calendar" do
    write_travels_to_calendar_api_event_path(event).should == "/v1/events/#{event.id}/write_travels_to_calendar"
    {:post => api_url(write_travels_to_calendar_api_event_path(event))}.should route_to(:controller => 'api/events', :action => 'write_travels_to_calendar', :version => 'v1', :id => event.id.to_s)
  end

  it "should route to around" do
    around_api_event_path(event).should == "/v1/events/#{event.id}/around"
    {:get => api_url(around_api_event_path(event))}.should route_to(:controller => 'api/events', :action => 'around', :version => 'v1', :id => event.id.to_s)
  end
end

# encoding: utf-8
require 'spec_helper'

describe Api::UsersController do

  let (:user) {Factory(:user)}

  it "should route to status" do
    status_api_users_path.should == "/v1/users/status"
    {:get => api_url(status_api_users_path)}.should route_to(:controller => 'api/users', :action => 'status', :version => 'v1')
  end

  it "should route to purge_travels" do
    purge_travels_api_users_path.should == "/v1/users/purge_travels"
    {:put => api_url(purge_travels_api_users_path)}.should route_to(:controller => 'api/users', :action => 'purge_travels', :version => 'v1')
  end

end

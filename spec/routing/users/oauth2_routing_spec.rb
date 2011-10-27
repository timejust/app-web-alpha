# encoding: utf-8
require 'spec_helper'

describe Users::Oauth2Controller do

  it "should route to callback" do
    oauth2_callback_path.should == '/oauth2/callback'
    {:get => oauth2_callback_path}.should route_to(:controller => 'users/oauth2', :action => 'callback')
  end

  it "should route to failure" do
    oauth2_failure_path.should == '/oauth2/failure'
    {:get => oauth2_failure_path}.should route_to(:controller => 'users/oauth2', :action => 'failure')
  end

  it "should route to authorize" do
    oauth2_authorize_path.should == '/oauth2/authorize'
    {:get => oauth2_authorize_path}.should route_to(:controller => 'users/oauth2', :action => 'authorize')
  end

end

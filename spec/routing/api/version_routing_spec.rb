# encoding: utf-8
require 'spec_helper'

describe Api::VersionController do

  it "should route to show" do
    api_root_path.should == '/'
    {:post => api_url(api_root_path)}.should route_to(:controller => 'api/version', :action => 'show')
  end
end

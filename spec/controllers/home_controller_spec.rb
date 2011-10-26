require 'spec_helper'

describe HomeController do
  include Devise::TestHelpers

  describe "GET #index" do

    before :each do
      get :index
    end
    it "should render #index" do
      response.should render_template(:index)
    end

  end

end

require 'spec_helper'

describe Api::TravelStepsController do
  include Devise::TestHelpers

  describe 'user logged in' do

    let (:user) {Factory :user}
    let (:event) {
      event = Factory :event
      event.stub!(:user).and_return(user)
      event
    }
    let (:travel_step) {
      travel_step = mock_travel_step
      travel_step.stub!(:event).and_return(event)
      travel_step
    }

    before :each do
      sign_in(user)
    end

    before :each do
      request.host = "api.#{request.host}"
    end

    describe "DELETE #destroy" do

      before :each do
        TravelStep.should_receive(:find).with(travel_step.id).and_return(travel_step)
        travel_step.should_receive(:destroy).and_return(true)
        travel_step.should_receive(:to_json).and_return(mock_travel_step_json)
        delete :destroy, :version => 'v1', :id => travel_step.id, :format => :json
      end

      it "should respond with 204" do
        response.status.should == 204
      end

      it "should render travel_step as json" do
        response.body.should == mock_travel_step_json
      end

    end

    describe "PUT #confirm" do

      before :each do
        TravelStep.should_receive(:find).with(travel_step.id).and_return(travel_step)
        travel_step.should_receive(:confirm).and_return(true)
        travel_step.should_receive(:to_json).and_return(mock_travel_step_json)
        put :confirm, :version => 'v1', :id => travel_step.id, :format => :json
      end

      it "should respond with 204" do
        response.status.should == 204
      end

      it "should render travel_step as json" do
        response.body.should == mock_travel_step_json
      end

    end

    describe "PUT #bookmark" do

      before :each do
        TravelStep.should_receive(:find).with(travel_step.id).and_return(travel_step)
        travel_step.should_receive(:bookmark).and_return(true)
        travel_step.should_receive(:to_json).and_return(mock_travel_step_json)
        put :bookmark, :version => 'v1', :id => travel_step.id, :format => :json
      end

      it "should respond with 204" do
        response.status.should == 204
      end

      it "should render travel_step as json" do
        response.body.should == mock_travel_step_json
      end

    end

  end

  describe 'no user loged in' do

    let (:user)  {mock_user}
    let (:travel_step) {mock_travel_step}

    before :each do
      sign_out(:user)
    end

    before :each do
      request.host = "api.#{request.host}"
    end

    describe "DELETE #destroy" do

      before :each do
        delete :destroy, :version => 'v1', :id => travel_step.id, :format => :json
      end

      it "should respond with 401" do
        response.status.should == 401
      end

    end

    describe "PUT #confirm" do

      before :each do
        put :confirm, :version => 'v1', :id => travel_step.id, :format => :json
      end

      it "should respond with 401" do
        response.status.should == 401
      end

    end

    describe "PUT #bookmark" do

      before :each do
        put :bookmark, :version => 'v1', :id => travel_step.id, :format => :json
      end

      it "should respond with 401" do
        response.status.should == 401
      end

    end

  end

  describe 'other user logged in' do

    let (:user) {Factory :user}
    let (:event) {
      event = Factory :user
      event.stub!(:user).and_return(user)
      event
    }
    let (:travel_step) {
      travel_step = mock_travel_step
      travel_step.stub!(:event).and_return(event)
      travel_step
    }
    let (:bad_user) {Factory :user}

    before :each do
      sign_in(bad_user)
    end

    before :each do
      request.host = "api.#{request.host}"
    end

    describe "DELETE #destroy" do

      before :each do
        TravelStep.should_receive(:find).with(travel_step.id).and_return(travel_step)
        delete :destroy, :version => 'v1', :id => travel_step.id, :format => :json
      end

      it "should respond with 401" do
        response.status.should == 401
      end

    end

    describe "PUT #confirm" do

      before :each do
        TravelStep.should_receive(:find).with(travel_step.id).and_return(travel_step)
        put :confirm, :version => 'v1', :id => travel_step.id, :format => :json
      end

      it "should respond with 401" do
        response.status.should == 401
      end

    end

    describe "PUT #bookmark" do

      before :each do
        TravelStep.should_receive(:find).with(travel_step.id).and_return(travel_step)
        put :bookmark, :version => 'v1', :id => travel_step.id, :format => :json
      end

      it "should respond with 401" do
        response.status.should == 401
      end

    end

  end
end

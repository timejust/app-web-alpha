require 'spec_helper'

describe Api::EventsController do
  include Devise::TestHelpers

  describe 'user logged in' do

    let (:user) {Factory :user}
    let (:event) {
      event = mock_event
      event.stub!(:user).and_return(user)
      event
    }

    before :each do
      sign_in(user)
      controller.stub!(:current_user).and_return(user)
    end

    before :each do
      request.host = "api.#{request.host}"
    end

    describe "POST #create" do

      context "without event" do

        before :each do
          post :create, :version => 'v1', :format => :json
        end

        it "should respond with 422" do
          response.status.should == 422
        end

        it "should respond nothing" do
          response.body.should be_blank
        end

      end

      context "with valid params" do

        before :each do
          Event.should_receive(:parse_from_google_gadget).with(mock_google_event_json).and_return(event)
          event.should_receive(:user=).with(user)
          event.should_receive(:created_at=)
          event.should_receive(:save).and_return(true)
          event.should_receive(:to_json).and_return(mock_event_json)
          user.should_receive(:purge_travels)
          user.should_receive(:find_or_create_calendars)
          post :create, :version => 'v1', :email => 'mail@example.com', :event => mock_google_event_json, :format => :json
        end

        it "should respond with 201" do
          response.status.should == 201
        end

        it "should render event as json" do
          response.body.should == mock_event_json
        end

      end

      context "with invalid params" do

        before :each do
          Event.should_receive(:parse_from_google_gadget).with(mock_google_event_json).and_return(event)
          event.should_receive(:user=).with(user)
          event.should_receive(:created_at=)
          event.should_receive(:save).and_return(false)
          user.should_receive(:purge_travels)
          user.should_receive(:find_or_create_calendars)
          event.should_receive(:errors).and_return({:base => :invalid})
          post :create, :version => 'v1', :email => 'mail@example.com', :event => mock_google_event_json, :format => :json
        end

        it "should respond with 422" do
          response.status.should == 422
        end

        it "should render event as json" do
          response.body.should == {:base => :invalid}.to_json
        end

      end

      context "with user that have not authorized timejust" do

        before :each do
          user.should_receive(:find_or_create_calendars).and_raise(OAuth2::AccessDenied)
          post :create, :version => 'v1', :email => 'mail@example.com', :event => mock_google_event_json, :format => :json
        end

        it "should respond with 401" do
          response.status.should == 401
          response.body.should be_blank
        end

      end

    end

    describe "GET #travel_nodes" do

      context "with event not travel_nodes_done" do

        context "waiting for workers to process" do

          before :each do
            Event.should_receive(:find).with(event.id).and_return(event)
            event.should_receive(:travel_nodes_done?).and_return(false)
            event.should_receive(:waiting?).and_return(true)
            get :travel_nodes, :id => event.id, :format => :json
          end

          it "should respond with 404" do
            response.status.should == 404
          end

          it "should render nothing" do
            response.body.should be_blank
          end

        end

        context "workers processing" do

          before :each do
            Event.should_receive(:find).with(event.id).and_return(event)
            event.should_receive(:travel_nodes_done?).and_return(false)
            event.should_receive(:waiting?).and_return(false)
            event.should_receive(:travel_nodes_progress?).and_return(true)
            get :travel_nodes, :id => event.id, :format => :json
          end

          it "should respond with 404" do
            response.status.should == 404
          end

          it "should render nothing" do
            response.body.should be_blank
          end

        end

      end

      context "with event travel_nodes_done" do

        context "workers waiting for user confirmation" do

          before :each do
            Event.should_receive(:find).with(event.id).and_return(event)
            event.should_receive(:travel_nodes_done?).and_return(true)
            event.should_receive(:to_json).and_return(mock_event_json)
            get :travel_nodes, :id => event.id, :format => :json
          end

          it "should respond with 200" do
            response.status.should == 200
          end

          it "should render event as json" do
            response.body.should == mock_event_json
          end

        end

        context "workers are processing travels" do

          before :each do
            Event.should_receive(:find).with(event.id).and_return(event)
            event.should_receive(:travel_nodes_done?).and_return(false)
            event.should_receive(:waiting?).and_return(false)
            event.should_receive(:travel_nodes_progress?).and_return(false)
            get :travel_nodes, :id => event.id, :format => :json
          end

          it "should respond with 410" do
            response.status.should == 410
          end

          it "should render nothing" do
            response.body.should be_blank
          end

        end

      end

    end

    describe "POST #travel_nodes_confirmation" do

      before :each do
        Event.should_receive(:find).with(event.id).and_return(event)
        event.should_receive(:create_previous_travel_node).with("address" => "address 1", "title" => "tag1")
        event.should_receive(:create_current_travel_node).with("address" => "address 2", "title" => "tag2")
        event.should_receive(:create_next_travel_node).with("address" => "address 3", "title" => "tag3")
        event.should_receive(:wait)
        event.should_receive(:save).and_return(true)
        event.should_receive(:check_for_favorite_locations)
        event.should_receive(:to_json).and_return(mock_event_json)
        post :travel_nodes_confirmation,
          :id => event.id,
          :previous_travel_node => {address: "address 1", title: "tag1"},
          :current_travel_node => {address: "address 2", title: "tag2"},
          :next_travel_node => {address: "address 3", title: "tag3"},
          :format => :json
      end

      it "should respond with 200" do
        response.status.should == 200
      end

      it "should render event as json" do
        response.body.should == mock_event_json
      end

    end

    describe "GET #travels" do

      context "with event not travels_done" do

        before :each do
          Event.should_receive(:find).with(event.id).and_return(event)
          event.should_receive(:travels_done?).and_return(false)
          event.should_receive(:canceled?).and_return(false)
          get :travels, :id => event.id, :format => :json
        end

        it "should respond with 404" do
          response.status.should == 404
        end

        it "should render nothing" do
          response.body.should be_blank
        end

      end

      context "with event canceled" do

        before :each do
          Event.should_receive(:find).with(event.id).and_return(event)
          event.should_receive(:travels_done?).and_return(false)
          event.should_receive(:canceled?).and_return(true)
          get :travels, :id => event.id, :format => :json
        end

        it "should respond with 410" do
          response.status.should == 410
        end

        it "should render nothing" do
          response.body.should be_blank
        end

      end

      context "with event travels_done" do

        before :each do
          Event.should_receive(:find).with(event.id).and_return(event)
          event.should_receive(:travels_done?).and_return(true)
          event.should_receive(:to_json).and_return(mock_event_json)
          get :travels, :id => event.id, :format => :json
        end

        it "should respond with 200" do
          response.status.should == 200
        end

        it "should render event as json" do
          response.body.should == mock_event_json
        end

      end

    end

    describe "PUT #cancel" do

      context "with valid params" do

        before :each do
          Event.should_receive(:find).with(event.id).and_return(event)
          event.should_receive(:cancel).and_return(true)
          event.should_receive(:to_json).and_return(mock_event_json)
          put :cancel, :id => event.id, :format => :json
        end

        it "should respond with 200" do
          response.status.should == 200
        end

        it "should render event as json" do
          response.body.should == mock_event_json
        end

      end

      context "with invalid params" do

        before :each do
          Event.should_receive(:find).with(event.id).and_return(event)
          event.should_receive(:cancel).and_return(false)
          put :cancel, :id => event.id, :format => :json
        end

        it "should respond with 422" do
          response.status.should == 422
        end

        it "should render nothing" do
          response.body.should be_blank
        end

      end

    end

    describe "PUT #add_google_info" do

      before :each do
        access_token = mock_oauth2_access_token
        Event.should_receive(:find).with(event.id).and_return(event)
        event.should_receive(:user).and_return(user)
        user.should_receive(:access_token).and_return(access_token)
        event.should_receive(:add_google_info).with(access_token)
        event.should_receive(:save).and_return(true)
        event.should_receive(:to_json).and_return(mock_event_json)
        put :add_google_info, :id => event.id, :format => :json
      end

      it "should respond with 200" do
        response.status.should == 200
      end

      it "should render event as json" do
        response.body.should == mock_event_json
      end

    end

    describe "POST #write_travels_to_calendar" do

      before :each do
        Event.should_receive(:find).with(event.id).and_return(event)
        event.should_receive(:write_travels_to_calendar)
        event.should_receive(:to_json).and_return(mock_event_json)
        post :write_travels_to_calendar, :id => event.id, :format => :json
      end

      it "should respond with 200" do
        response.status.should == 200
      end

      it "should render event as json" do
        response.body.should == mock_event_json
      end

    end

    describe "GET #around" do

      before :each do
        other_event = Factory :event
        @events = [other_event]
        Event.should_receive(:find).with(event.id).and_return(event)
        event.should_receive(:around_events).with("2").and_return(@events)
        get :around, :id => event.id, :format => :json, :offset => 2
      end

      it "should respond with 200" do
        response.status.should == 200
      end

      it "should respond with events as json" do
        response.body.should == @events.to_json
      end
    end

  end

  describe 'no user loged in' do

    let (:user)  {mock_user}
    let (:event) {mock_event}

    before :each do
      sign_out(:user)
    end

    before :each do
      request.host = "api.#{request.host}"
    end

    describe "POST #create" do

      context "with valid params" do

        before :each do
          post :create, :version => 'v1', :event => mock_google_event_json, :format => :json
        end

        it "should respond with 401" do
          response.status.should == 401
        end

      end

    end

    describe "GET #travel_nodes" do

      context "with event travel_nodes_done" do

        before :each do
          get :travel_nodes, :id => event.id, :format => :json
        end

        it "should respond with 401" do
          response.status.should == 401
        end

      end

    end

    describe "POST #travel_nodes_confirmation" do

      before :each do
        post :travel_nodes_confirmation,
          :id => event.id,
          :previous_travel_node => {address: "address 1", title: "tag1"},
          :current_travel_node => {address: "address 2", title: "tag2"},
          :next_travel_node => {address: "address 3", title: "tag3"},
          :format => :json
      end

      it "should respond with 401" do
        response.status.should == 401
      end

    end

    describe "GET #travels" do

      context "with event travels_done" do

        before :each do
          get :travels, :id => event.id, :format => :json
        end

        it "should respond with 401" do
          response.status.should == 401
        end

      end

    end

    describe "PUT #cancel" do

      context "with valid params" do

        before :each do
          put :cancel, :id => event.id, :format => :json
        end

        it "should respond with 401" do
          response.status.should == 401
        end

      end

    end

    describe "PUT #add_google_info" do

      before :each do
        put :add_google_info, :id => event.id, :format => :json
      end

      it "should respond with 401" do
        response.status.should == 401
      end

    end

    describe "POST #write_travels_to_calendar" do

      before :each do
        post :write_travels_to_calendar, :id => event.id, :format => :json
      end

      it "should respond with 401" do
        response.status.should == 401
      end

    end

    describe "GET #around" do

      before :each do
        get :around, :id => event.id, :format => :json
      end

      it "should respond with 401" do
        response.status.should == 401
      end

    end

  end

  describe 'other user logged in' do

    let (:user) {Factory :user}
    let (:bad_user) {Factory :user}
    let (:event) {
      event = mock_event
      event.stub!(:user).and_return(user)
      event
    }

    before :each do
      sign_in(bad_user)
    end

    before :each do
      request.host = "api.#{request.host}"
    end

    describe "GET #travel_nodes" do

      context "with event travel_nodes_done" do

        before :each do
          Event.should_receive(:find).with(event.id).and_return(event)
          get :travel_nodes, :id => event.id, :format => :json
        end

        it "should respond with 401" do
          response.status.should == 401
        end

      end

    end

    describe "POST #travel_nodes_confirmation" do

      before :each do
        Event.should_receive(:find).with(event.id).and_return(event)
        post :travel_nodes_confirmation,
          :id => event.id,
          :previous_travel_node => {address: "address 1", title: "tag1"},
          :current_travel_node => {address: "address 2", title: "tag2"},
          :next_travel_node => {address: "address 3", title: "tag3"},
          :format => :json
      end

      it "should respond with 401" do
        response.status.should == 401
      end

    end

    describe "GET #travels" do

      context "with event travels_done" do

        before :each do
          Event.should_receive(:find).with(event.id).and_return(event)
          get :travels, :id => event.id, :format => :json
        end

        it "should respond with 401" do
          response.status.should == 401
        end

      end

    end

    describe "PUT #cancel" do

      context "with valid params" do

        before :each do
          Event.should_receive(:find).with(event.id).and_return(event)
          put :cancel, :id => event.id, :format => :json
        end

        it "should respond with 401" do
          response.status.should == 401
        end

      end

    end

    describe "PUT #add_google_info" do

      before :each do
        Event.should_receive(:find).with(event.id).and_return(event)
        put :add_google_info, :id => event.id, :format => :json
      end

      it "should respond with 401" do
        response.status.should == 401
      end

    end

    describe "POST #write_travels_to_calendar" do

      before :each do
        Event.should_receive(:find).with(event.id).and_return(event)
        post :write_travels_to_calendar, :id => event.id, :format => :json
      end

      it "should respond with 401" do
        response.status.should == 401
      end

    end

    describe "GET #around" do

      before :each do
        Event.should_receive(:find).with(event.id).and_return(event)
        get :around, :id => event.id, :format => :json
      end

      it "should respond with 401" do
        response.status.should == 401
      end

    end

  end
end

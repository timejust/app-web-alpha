require 'spec_helper'
include FactoryGirl::Syntax::Methods

describe Api::UsersController do
  include Devise::TestHelpers

  # describe 'user logged in' do
  # 
  #   let (:user) {
  #     user = build(:user)
  #     # Factory :user
  #   }
  # 
  #   before :each do
  #     sign_in(user)
  #   end
  # 
  #   before :each do
  #     request.host = "api.#{request.host}"
  #   end
  # 
  #   describe "GET #status" do
  # 
  #     describe "with user which is not in database" do
  # 
  #       before :each do
  #         User.should_receive(:exists?).with(conditions: {email: "mail@example.com"}).and_return(false)
  #         get :status, :email => "mail@example.com", :format => :json
  #       end
  # 
  #       it "should respond with 404" do
  #         response.status.should == 404
  #         response.body.should be_blank
  #       end
  # 
  #     end
  # 
  #     describe "with user which has no pending event" do
  # 
  #       before :each do
  #         User.should_receive(:exists?).with(conditions: {email: "mail@example.com"}).and_return(true)
  #         User.should_receive(:where).with(email: "mail@example.com").and_return([user])
  #         user.should_receive(:has_pending_events?).and_return(false)
  #         user.should_receive(:find_or_create_calendars)
  #         get :status, :email => "mail@example.com", :format => :json
  #       end
  # 
  #       it "should respond with 204" do
  #         response.status.should == 204
  #         response.body.should be_blank
  #       end
  # 
  #     end
  # 
  #     describe "with user which has pending event" do
  # 
  #       before :each do
  #         #@event = Factory :event
  #         @event = build(:event)
  #         User.should_receive(:exists?).with(conditions: {email: "mail@example.com"}).and_return(true)
  #         User.should_receive(:where).with(email: "mail@example.com").and_return([user])
  #         user.should_receive(:has_pending_events?).and_return(true)
  #         user.should_receive(:last_pending_event).and_return(@event)
  #         user.should_receive(:find_or_create_calendars)
  #         @event.should_receive(:to_json).and_return(mock_event_json)
  #         get :status, :email => "mail@example.com", :format => :json
  #       end
  # 
  #       it "should respond with 200" do
  #         response.status.should == 200
  #         response.body.should == mock_event_json
  #       end
  # 
  #       it "should assign event" do
  #         assigns(:event).should == @event
  #       end
  # 
  #     end
  # 
  #     describe "with user which has not authorized Timejust to access his calendar" do
  # 
  #       before :each do
  #         #@event = Factory :event
  #         event = build(:event)
  #         User.should_receive(:exists?).with(conditions: {email: "mail@example.com"}).and_return(true)
  #         User.should_receive(:where).with(email: "mail@example.com").and_return([user])
  #         user.should_receive(:find_or_create_calendars).and_raise(OAuth2::AccessDenied)
  #         get :status, :email => "mail@example.com", :format => :json
  #       end
  # 
  #       it "should respond with 401" do
  #         response.status.should == 401
  #         response.body.should be_blank
  #       end
  # 
  #     end
  # 
  #   end
  # 
  #   describe "PUT purge_travels" do
  # 
  #     before :each do
  #       put :purge_travels, :format => :json
  #     end
  # 
  #     it "should respond with 202" do
  #       response.status.should == 202
  #     end
  # 
  #     it "should respond user in json format" do
  #       response.body.should == user.to_json
  #     end
  #   end
  # 
  # end
  # 
  # describe 'no user loged in' do
  # 
  #   let (:user)  {mock_user}
  #   let (:event) {mock_event}
  # 
  #   before :each do
  #     sign_out(:user)
  #   end
  # 
  #   before :each do
  #     request.host = "api.#{request.host}"
  #   end
  # 
  #   describe "GET #status" do
  # 
  #     describe "with user which has pending event" do
  # 
  #       before :each do
  #         get :status, :email => "mail@example.com", :format => :json
  #       end
  # 
  #       it "should respond with 401" do
  #         response.status.should == 401
  #       end
  # 
  #     end
  # 
  #   end
  # 
  #   describe "PUT purge_travels" do
  # 
  #     before :each do
  #       put :purge_travels, :format => :json
  #     end
  # 
  #     it "should respond with 401" do
  #       response.status.should == 401
  #     end
  # 
  #   end
  # 
  # end
  # 
  # describe 'other user logged in' do
  # 
  #   let (:user) {build(:user)}
  #   let (:bad_user) {build(:user)}
  #   let (:event) {
  #     event = mock_event
  #     event.stub!(:user).and_return(user)
  #     event
  #   }
  # 
  #   before :each do
  #     sign_in(bad_user)
  #   end
  # 
  #   before :each do
  #     request.host = "api.#{request.host}"
  #   end
  # 
  #   describe "GET #status" do
  # 
  #     describe "with user which has pending event" do
  # 
  #       before :each do
  #         User.should_receive(:exists?).with(conditions: {email: "mail@example.com"}).and_return(true)
  #         User.should_receive(:where).with(email: 'mail@example.com').and_return([user])
  #         get :status, :email => "mail@example.com", :format => :json
  #       end
  # 
  #       it "should respond with 401" do
  #         response.status.should == 401
  #       end
  # 
  #     end
  # 
  #   end
  # 
  # end

end

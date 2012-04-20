# encoding: utf-8
require 'spec_helper'

describe Users::Oauth2Controller do
  include Devise::TestHelpers

  render_views

  # let(:user) { Factory :user }
  # let(:authorize_url) { "http://example.com/oauth2" }
  # let(:access_token) { mock_oauth2_access_token }
  # let(:email) { "test@example.com" }
  # 
  # describe "GET authorize" do
  # 
  #   before :each do
  #     OAuthHelper.stub_chain(:client, :web_server, :authorize_url).with(
  #       :redirect_uri => oauth2_callback_url,
  #       :scope        => "https://www.googleapis.com/auth/userinfo#email https://www.google.com/calendar/feeds/"
  #     ).and_return(authorize_url)
  #   end
  # 
  #   it 'should be redirected to oauth authorize url' do
  #     get :authorize
  #     session[:return_to].should be_nil
  #     response.should redirect_to authorize_url
  #   end
  # 
  #   it 'should store redirect_to params into session' do
  #     get :authorize, return_to: "http://google.com/calendar"
  #     session[:return_to].should == "http://google.com/calendar"
  #     response.should redirect_to authorize_url
  #   end
  # end
  # 
  # describe "GET callback" do
  #   describe "without errors" do
  # 
  #     before :each do
  #       OAuthHelper.stub_chain(:client, :web_server, :get_access_token).with(
  #         "!HelloThisIsAnAuthorizationCode$",
  #         :redirect_uri => oauth2_callback_url
  #       ).and_return(access_token)
  #       access_token.should_receive(:get).
  #         with("https://www.googleapis.com/userinfo/email?alt=json").
  #         and_return({"data"=> {"email"=>"#{email}", "isVerified"=>true}})
  #       User.should_receive(:find_or_initialize_by).with(:email => email).and_return(user)
  #       user.should_receive(:update_attributes).with(
  #         :token => access_token.token,
  #         :refresh_token => access_token.refresh_token,
  #         :token_expires_at => access_token.expires_at
  #       )
  #       user.should_receive(:find_or_create_calendars)
  #     end
  # 
  #     it 'should assigns @access_token' do
  #       get :callback, :code => "!HelloThisIsAnAuthorizationCode$"
  #       assigns(:access_token).should == access_token
  #     end
  # 
  #     it 'should redirect to root_path if session[:return_to] is nil' do
  #       session[:return_to] = nil
  #       get :callback, :code => "!HelloThisIsAnAuthorizationCode$"
  #       response.should redirect_to root_path
  #     end
  # 
  #     it 'should redirect to session[:return_to] if not nil' do
  #       session[:return_to] = "http://google.com/calendar"
  #       get :callback, :code => "!HelloThisIsAnAuthorizationCode$"
  #       response.should redirect_to "http://google.com/calendar"
  #     end
  # 
  #   end
  # 
  #   describe "with errors" do
  # 
  #     before :each do
  #       get :callback, :error => 'access_denied'
  #     end
  # 
  #     it 'should redirect to failure page' do
  #       response.should redirect_to(oauth2_failure_path)
  #     end
  # 
  #   end
  # 
  # end
end

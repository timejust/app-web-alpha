# encoding: utf-8
require 'spec_helper'

describe Users::OmniauthCallbacksController do
  include Devise::TestHelpers

  render_views

  let(:user) { mock_user }

  describe "GET google" do
    before :each do
      stub_env_for_omniauth_openid
      User.should_receive(:find_for_openid).with(google_mock, nil).and_return(user)
      get :openid
    end

    it 'should assigns @user' do
      assigns(:user).should == user
    end

    it 'should be redirected' do
      response.should redirect_to root_path
    end

    it 'should set flash notice' do
      flash[:notice].should == I18n.t("devise.omniauth_callbacks.success", :kind => 'Google')
    end
  end
end

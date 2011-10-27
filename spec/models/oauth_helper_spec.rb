require 'spec_helper'

describe OAuthHelper do

  let (:client) {
    mock_oauth2_client
  }

  it "should initialise OAuth2::Client" do
    OAuthHelper.client = nil
    OAuth2::Client.should_receive(:new).with(
      configatron.gapps.oauth.for_gmail.consumer_key,
      configatron.gapps.oauth.for_gmail.consumer_secret,
      :site             => 'https://accounts.google.com',
      :authorize_url    => '/o/oauth2/auth',
      :access_token_url => '/o/oauth2/token',
      :parse_json       => true
    ).and_return(client)
    OAuthHelper.client.should_not be_nil
  end

end

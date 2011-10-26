# encoding: utf-8
def mock_oauth2_client
  client = mock("OAuth2ClientTest")
  OAuth2::Client.stub!(:new).and_return(client)
  client
end

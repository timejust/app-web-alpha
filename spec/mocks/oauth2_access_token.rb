# encoding: utf-8
def mock_oauth2_access_token
  token = mock
  token.stub!(:token).and_return("ThisIsAToken")
  token.stub!(:refresh_token).and_return("ThisIsARefreshToken")
  token.stub!(:expires_at).and_return(Time.now + 1.hour)
  token.stub!(:expired?).and_return(false)
  token
end

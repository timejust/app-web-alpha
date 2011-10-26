# encoding: utf-8
def mock_user(stubs={})
  mock = mock_model(User, stubs)
  mock.stub!(:id).and_return("47cc67093475061e3d95369d")
  mock.stub!(:login).and_return("user_#{rand(100)}#{Time.now.to_i}")
  mock.stub!(:email).and_return("email@example.com")
  mock.stub!(:authenticatable_salt)
  mock
end

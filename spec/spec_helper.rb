# encoding: utf-8

require 'simplecov'
SimpleCov.start 'rails'

# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV["RAILS_ENV"] ||= 'test'
require File.expand_path("../../config/environment", __FILE__)
require 'rspec/rails'

# Requires supporting ruby files with custom matchers and macros, etc,
# in spec/support/ and its subdirectories.
Dir[Rails.root.join("spec/support/**/*.rb")].each {|f| require f}

# Requires mocks
Dir["#{File.dirname(__FILE__)}/mocks/**/*.rb"].each {|f| require f}

OmniAuth.config.test_mode = true

RSpec.configure do |config|
  # == Mock Framework
  #
  # If you prefer to use mocha, flexmock or RR, uncomment the appropriate line:
  #
  # config.mock_with :mocha
  # config.mock_with :flexmock
  # config.mock_with :rr
  config.mock_with :rspec
  config.include Mongoid::Matchers

  # Remove this line if you're not using ActiveRecord or ActiveRecord fixtures
  # config.fixture_path = "#{::Rails.root}/spec/fixtures"

  # If you're not using ActiveRecord, or you'd prefer not to run each of your
  # examples within a transaction, remove the following line or assign false
  # instead of true.
  # config.use_transactional_fixtures = true

  # email_spec config
  config.include(EmailSpec::Helpers)
  config.include(EmailSpec::Matchers)
end

# OmniAuth
def google_mock(opt={})
  {
    'provider'  => 'google',
    'user_info' => {
      'name'    => 'Laurent A',
      'uid'     => 'laurent.a@af83.com',
      'email'   => 'laurent.a@af83.com'
    }
  }.merge(opt)
end

def stub_env_for_omniauth_openid
  # This a Devise specific thing for functional tests. See https://github.com/plataformatec/devise/issues/closed#issue/608
  request.env["devise.mapping"] = Devise.mappings[:user]
  env = { "omniauth.auth" => google_mock }
  @controller.stub!(:env).and_return(env)
end

def api_url(path)
  "http://api.test.host#{path}"
end

OmniAuth.config.mock_auth[:openid] = google_mock['user_info']

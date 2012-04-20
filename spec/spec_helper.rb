# encoding: utf-8

require 'simplecov'

SimpleCov.start 'rails'

# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV["RAILS_ENV"] ||= 'test'

require 'oauth2'
require File.expand_path("../../config/environment", __FILE__)
require 'rspec/rails'
require 'webmock/rspec'

# Requires supporting ruby files with custom matchers and macros, etc,
# in spec/support/ and its subdirectories.
Dir[Rails.root.join("spec/support/**/*.rb")].each {|f| require f}

# Requires mocks
Dir["#{File.dirname(__FILE__)}/mocks/**/*.rb"].each {|f| require f}

# Requires factories
# Dir["#{File.dirname(__FILE__)}/factories/*.rb"].each {|f| require f}

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
  config.include WebMock::API
  config.include FactoryGirl::Syntax::Methods

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

def google_event_mock
  {"apiVersion"=>"2.6",
    "data"=>{"kind"=>"calendar#event",
      "etag"=>"\"EEsPTgdFfSp7JGA6WhJW\"",
      "id"=>"0eup5kh6jp61cv3mnh6oscnmtg",
      "selfLink"=>"https://www.google.com/calendar/feeds/timejust.dev.af83%40gmail.com/private/full/0eup5kh6jp61cv3mnh6oscnmtg",
      "alternateLink"=>"https://www.google.com/calendar/event?eid=MGV1cDVraDZqcDYxY3YzbW5oNm9zY25tdGdfMjAxMTA5MDNUMTEwMDAwWiB0aW1lanVzdC5kZXYuYWY4M0Bt",
      "canEdit"=>true,
      "title"=>"Payer une binouse à spk",
      "created"=>"2011-09-02T09:04:45.000Z",
      "updated"=>"2011-09-02T15:09:03.000Z",
      "details"=>"",
      "status"=>"confirmed",
      "creator"=>{"displayName"=>"timejust.dev.af83@gmail.com",
        "email"=>"timejust.dev.af83@gmail.com"},
        "anyoneCanAddSelf"=>false,
        "guestsCanInviteOthers"=>true,
        "guestsCanModify"=>false,
        "guestsCanSeeGuests"=>true,
        "sequence"=>0,
        "transparency"=>"opaque",
        "visibility"=>"default",
        "location"=>"15 rue poisonnières, paris",
 "attendees"=>[{"rel"=>"organizer",
   "displayName"=>"timejust.dev.af83@gmail.com",
   "email"=>"timejust.dev.af83@gmail.com"}],
   "recurrence"=>"DTSTART;TZID=Europe/Paris:20110903T130000\r\nDTEND;TZID=Europe/Paris:20110903T140000\r\nRRULE:FREQ=WEEKLY;BYDAY=SA\r\nBEGIN:VTIMEZONE\r\nTZID:Europe/Paris\r\nX-LIC-LOCATION:Europe/Paris\r\nBEGIN:DAYLIGHT\r\nTZOFFSETFROM:+0100\r\nTZOFFSETTO:+0200\r\nTZNAME:CEST\r\nDTSTART:19700329T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU\r\nEND:DAYLIGHT\r\nBEGIN:STANDARD\r\nTZOFFSETFROM:+0200\r\nTZOFFSETTO:+0100\r\nTZNAME:CET\r\nDTSTART:19701025T030000\r\nRRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU\r\nEND:STANDARD\r\nEND:VTIMEZONE\r\n",
   "reminders"=>[{"minutes"=>10,
     "method"=>"email"},
     {"minutes"=>10,
       "method"=>"alert"}]}}
end

OmniAuth.config.mock_auth[:openid] = google_mock['user_info']

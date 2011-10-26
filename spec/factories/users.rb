# Read about factories at http://github.com/thoughtbot/factory_girl

Factory.define :user do |f|
  f.email             { Faker::Internet.email }
  f.token             { "MyTestAccessToken" }
  f.refresh_token     { "MyTestRefreshToken" }
  f.token_expires_at  { Time.now + 1.hour }
end

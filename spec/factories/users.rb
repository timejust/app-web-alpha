# Read about factories at http://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :user do
    email             { Faker::Internet.email }
    token             { "MyTestAccessToken" }
    refresh_token     { "MyTestRefreshToken" }
    token_expires_at  { Time.now + 1.hour }
  end
end

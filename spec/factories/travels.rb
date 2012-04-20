FactoryGirl.define do
  factory :travel do
    association           :user
    association           :event
    state                 'waiting'
    travel_mode           Travel.shared_calendars.keys.sample
    calendar              Travel.shared_calendars.values.sample[:name]
    provider              ['ratp', 'google-directions'].sample
  end
end

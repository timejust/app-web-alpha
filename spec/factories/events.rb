# Read about factories at http://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :event do
    id                    "47cc67093475061e3d95369d"    
    association           :user
    state                 'waiting'
    start_time            {Time.now + 1.hour}
    end_time              {Time.now + 2.hour}
  end
end

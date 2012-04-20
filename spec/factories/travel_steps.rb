# Read about factories at http://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :travel_step do
    provider          {['ratp', 'google-directions'].sample}
    departure_time    {Time.now}
    arrival_time      {Time.now + 1.hours}
    # event             {Factory :event}
    user              {build(:user)}
    # travel            {Factory :travel}
    travel_type       {%w{forward backward}.sample}
    summary           {['transport1', 'transport2']}
  end
end

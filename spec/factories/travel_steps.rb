# Read about factories at http://github.com/thoughtbot/factory_girl

Factory.define :travel_step do |f|
  f.provider          {['ratp', 'google-directions'].sample}
  f.departure_time    {Time.now}
  f.arrival_time      {Time.now + 1.hours}
  f.event             {Factory :event}
  f.user              {Factory :user}
  f.travel            {Factory :travel}
  f.travel_type       {%w{forward backward}.sample}
  f.summary           {['transport1', 'transport2']}
end

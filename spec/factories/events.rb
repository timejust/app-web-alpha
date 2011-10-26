# Read about factories at http://github.com/thoughtbot/factory_girl

Factory.define :event do |f|
  f.association           :user
  f.state                 'waiting'
  f.start_time            {Time.now + 1.hour}
  f.end_time              {Time.now + 2.hour}
end

Factory.define :travel do |f|
  f.association           :user
  f.association           :event
  f.state                 'waiting'
  f.travel_mode           Travel.shared_calendars.keys.sample
  f.calendar              Travel.shared_calendars.values.sample[:name]
  f.provider              ['ratp', 'google-directions'].sample
end

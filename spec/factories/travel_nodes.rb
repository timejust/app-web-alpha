# Read about factories at http://github.com/thoughtbot/factory_girl

Factory.define :travel_node do |f|
  f.title   ""
  f.address "#{Faker::Address.street_name} #{Faker::Address.zip_code}, Paris, France"
end

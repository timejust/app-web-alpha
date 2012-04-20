# Read about factories at http://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :tj_event do
    calendar_id = "groupe-stone.fr_9ptjijl66curia4sbvjk8616d4@group.calendar.google.com"
    start = 1333542000
    end_ = 1333544000
    lat = 0.0
    lng = 0.0
    location = "26 rue de longchamp, Neuilly Sursene"
    summary = "testing"
    description = "testing purpose"
  end
end

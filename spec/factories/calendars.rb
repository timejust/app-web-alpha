# Read about factories at http://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :calendar do
    google_id         "http://www.google.com/calendar/feeds/default/calendars/2hldm2lvheqkp4cgqahq7jd7fg%40group.calendar.google.com"
    google_short_id   "2hldm2lvheqkp4cgqahq7jd7fg%40group.calendar.google.com"
    name              "BlackProposal"
    color             "#000000"
  end
end

require 'spec_helper'

describe Google::Calendar do

  let (:access_token) {
    mock_oauth2_access_token
  }

  it "should create Google Calendar" do
    access_token.should_receive(:post).with(
      'https://www.google.com/calendar/feeds/default/owncalendars/full',
      ({
        data: {
          timeZone: "Europe/Paris",
          hidden: false,
          color: "#2952A3",
          location: "Paris",
          title: "Calendar Title",
          description: "Calendar Description"
        }
      }.to_json),
      {'Content-Type' => 'application/json', 'GData-Version' => '2'}
    )
   Google::Calendar.create(
      access_token,
      {
        title: "Calendar Title",
        description: "Calendar Description"
      }
    )
  end

  it "should share Google Calendar" do
    access_token.should_receive(:post).with(
      "http://google_calendar_acl_url.com",
      ({
        data: {
          scope: 'test@example.com',
          scopeType: "user",
          role: "read"
        }
      }.to_json),
      {'Content-Type' => 'application/json', 'GData-Version' => '2'}
    )
   Google::Calendar.share(
      access_token,
      "http://google_calendar_acl_url.com",
      {
        scope: 'test@example.com',
        scopeType: "user",
        role: "read"
      }
    )
  end

  it "should update Google Calendar subscription" do
    access_token.should_receive(:put).with(
      "http://google_calendar_self_link.com",
      ({
        data: {
        color: '#B1365F'
        }
      }.to_json),
      {'Content-Type' => 'application/json', 'GData-Version' => '2'}
    )
   Google::Calendar.update_subscription(
      access_token,
      "http://google_calendar_self_link.com",
      {
        color: '#B1365F'
      }
    )
  end

  it "should extract google calendar id from google calendar url" do
    Google::Calendar.extract_google_id(
      "http://www.google.com/calendar/feeds/default/calendars/75i3ouapng44h1dk3qsvrti5p0%40group.calendar.google.com"
    ).should == "75i3ouapng44h1dk3qsvrti5p0%40group.calendar.google.com"
  end
end

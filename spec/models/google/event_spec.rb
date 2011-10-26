# encoding: utf-8
require 'spec_helper'

describe Google::Event do

  let (:access_token) {
    mock_oauth2_access_token
  }

  let (:calendar_id) {
    "calendar_id"
  }

  let (:google_event_json) {
    mock_google_event_json
  }

  it "should create Google Event" do
    time_now = Time.now
    access_token.should_receive(:post).with(
      "https://www.google.com/calendar/feeds/#{calendar_id}/private/full",
      ({
        data: {
          title: "My Event Title",
          details: "My Event Detail",
          transparency: "opaque",
          status: "confirmed",
          location: "15 rue poisonnières",
          when: [
            {
              start: time_now.utc.iso8601,
              end: (time_now + 1.hours).utc.iso8601
            }
          ]
        }
      }.to_json),
      {'Content-Type' => 'application/json', 'GData-Version' => '2'}
    )
   Google::Event.create(
      access_token,
      calendar_id,
      {
        title: "My Event Title",
        details: "My Event Detail",
        transparency: "opaque",
        status: "confirmed",
        location: "15 rue poisonnières",
        when: [
          {
            start: time_now.utc.iso8601,
            end: (time_now + 1.hours).utc.iso8601
          }
        ]
      }
    )
  end

  it "should get google event" do
    access_token.should_receive(:get).with(
      "https://www.google.com/calendar/feeds/calendar_id/private/full/event_id?alt=jsonc",
      {},
      {'Content-Type' => 'application/json', 'GData-Version' => '2'}
    )
    Google::Event.get(access_token, "calendar_id", "event_id")
  end

  describe "#search_by_date_range" do

    it "should search in default calendar by default" do
      time_now = Time.now
      access_token.should_receive(:get).with(
        "https://www.google.com/calendar/feeds/default/private/full?alt=jsonc",
        {:"start-min" => time_now.iso8601, :"start-max" => (time_now + 1.minutes).iso8601},
        {'Content-Type' => 'application/json', 'GData-Version' => '2'}
      )
      Google::Event.search_by_date_range(access_token, time_now, time_now + 1.minutes)
    end

    it "should search in given calendar if given" do
      time_now = Time.now
      access_token.should_receive(:get).with(
        "https://www.google.com/calendar/feeds/my_custom_calendar/private/full?alt=jsonc",
        {:"start-min" => time_now.iso8601, :"start-max" => (time_now + 1.minutes).iso8601},
        {'Content-Type' => 'application/json', 'GData-Version' => '2'}
      )
      Google::Event.search_by_date_range(access_token, time_now, time_now + 1.minutes, "my_custom_calendar")
    end

  end

  it "should destroy" do
    Google::Request.should_receive(:delete).with(
      access_token,
      "https://www.google.com/calendar/feeds/#{calendar_id}/private/full/event_id"
    )
    Google::Event.destroy(access_token, calendar_id, "event_id")
  end

end

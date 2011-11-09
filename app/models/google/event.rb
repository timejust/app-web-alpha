class Google::Event

  # Get an event
  #
  # @param [OAuth2::AccessToken]  access_token
  # @param [String]               calendar_id
  # @param [String]               event_id
  #
  # @return [JSON]
  #
  def self.get(access_token, calendar_id, event_id)
    Google::Request.get(access_token, "https://www.google.com/calendar/feeds/#{calendar_id}/private/full/#{event_id}")
  end

  # Search for events by date range
  #
  # @param [OAuth2::AccessToken]  access_token
  # @param [Time]             start_min
  # @param [Datetime]             start_max
  # @param [String]               calendar_id
  #
  # @return [JSON]
  #
  def self.search_by_date_range(access_token, start_min, start_max, calendar_id = 'default')
    Google::Request.get(access_token, "https://www.google.com/calendar/feeds/#{calendar_id}/private/full", {:'start-min' => start_min.iso8601, :'start-max' => start_max.iso8601})
  end

  # Create a new event
  #
  # @param [OAuth2::AccessToken]  access_token
  # @param [String]               calendar_id
  # @param [Hash]                 opts
  #
  # @return [JSON]
  # TODO : remove fake data
  #  attendees: [{rel: "attendee", displayName: "Hello World", email: "kevinlacointe@gmail.com"}]
  #
  def self.create(access_token, calendar_id, params = {})
    default_params = {
      title: "Tennis with Beth",
      details: "Meet for a quick lesson.",
      transparency: "opaque",
      status: "confirmed",
      location: "Rolling Lawn Courts",
      when: [
        {
          start: Time.now.utc.iso8601,
          end: (Time.now + 1.hours).utc.iso8601
        }
      ]
    }
    Google::Request.post(access_token, "https://www.google.com/calendar/feeds/#{calendar_id}/private/full", default_params.merge!(params))
  end

  # Destroy an event
  #
  # @param [OAuth2::AccessToken]  access_token
  # @param [String]               calendar_id
  # @param [String]               event_id
  #
  # @return [JSON]
  #
  def self.destroy(access_token, calendar_id, event_id)
    Google::Request.delete(access_token, "https://www.google.com/calendar/feeds/#{calendar_id}/private/full/#{event_id}")
  end

end

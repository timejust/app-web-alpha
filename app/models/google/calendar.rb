# encoding: utf-8
class Google::Calendar

  # Get user calendar list for user related to access_token
  #
  # @param [OAauth2::AccessToken]   access_token, of user who create calendar
  #
  # @return [JSON]
  #
  def self.list(access_token)
    Google::Request.get(access_token, "https://www.google.com/calendar/feeds/default/allcalendars/full")
  end

  # Create a Google calendar for user related to access_token
  #
  # @param [OAauth2::AccessToken]   access_token, of user who create calendar
  # @param [Hash]                   opts, Hash with calendar infos
  # Example:
  #   {
  #     title: "Calendar Title",
  #     description: "Calendar Description"
  #   }
  #
  # @return [JSON]
  #
  # TODO :
  # * Raise errors when mandatory fields are not present
  #
  def self.create(access_token, params = {})
    default_params = {
      timeZone: "Europe/Paris",
      hidden: false,
      color: "#2952A3",
      location: "Paris"
    }
    Google::Request.post(access_token, 'https://www.google.com/calendar/feeds/default/owncalendars/full', default_params.merge!(params))
  end

  # Update a Google Calendar for user related to access_token
  #
  # @param [OAauth2::AccessToken]   access_token, of user who create calendar
  # @param [String]                 calendar_id, google calendar id
  # @param [Hash]                   opts, Hash with calendar infos
  # Example:
  #   {
  #     selected: true
  #   }
  #
  # @return [JSON]
  #
  def self.update(access_token, calendar_id, params = {})
    default_params = {}
    Google::Request.put(access_token, "https://www.google.com/calendar/feeds/default/owncalendars/full/#{calendar_id}", default_params.merge!(params))
  end

  # Destroy a Google calendar for user related to access_token
  #
  # @param [OAauth2::AccessToken]   access_token, of user who create calendar
  # @param [String]                 calendar_id, google calendar id
  #
  # @return [JSON]
  #
  def self.destroy(access_token, calendar_id)
    Google::Request.delete(access_token, "https://www.google.com/calendar/feeds/default/owncalendars/full/#{calendar_id}")
  end

  # Share a Google calendar owned by user related to access_token
  #
  # @param [OAauth2::AccessToken]   access_token, of user who share calendar
  # @param [String]                 url of calendar accessControlListLink
  # @param [Hash]                   opts, Hash with email/role
  # Example:
  #   {
  #     scope: 'test@example.com',
  #     scopeType: "user",
  #     role: "read"
  #   }
  #
  # @return [JSON]
  #
  # TODO :
  # * Raise errors when mandatory fields are not present
  # * Interpret 409 : already shared
  #
  def self.share(access_token, calendar_acl_url, params = {})
    Google::Request.post(access_token, calendar_acl_url, params)
  end

  # Update calendar subscription for a subscriber
  #
  # @param [OAauth2::AccessToken]   access_token, of user who share calendar
  # @param [String]                 url of calendar selfLink
  # @param [Hash]                   opts, Hash with subscriptions properties
  # Example:
  #   {
  #     color: '#B1365F',
  #   }
  #
  # @return [JSON]
  #
  def self.update_subscription(access_token, calendar_self_link, params = {})
    Google::Request.put(access_token, calendar_self_link, params)
  end

  # Google calendar id is return as an url.
  # Example : http://www.google.com/calendar/feeds/default/calendars/75i3ouapng44h1dk3qsvrti5p0%40group.calendar.google.com
  # Need to store only calendar id : 75i3ouapng44h1dk3qsvrti5p0%40group.calendar.google.com
  #
  # @param [String]   google_id, google calendar id url
  #
  # @return [String]  google calendar id
  # TODO : specs
  #
  def self.extract_google_id(google_id)
    google_id.gsub(/^.*\/(.*$)/, '\1')
  end
end

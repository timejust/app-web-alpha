# encoding: utf-8

class OAuthHelper

  # Return an OAuth2::Client for the current application
  # Credentials are stored in configatron
  #
  # @return [OAuth2:Client]
  #
  def self.client
    @@client ||= OAuth2::Client.new(
      configatron.gapps.oauth.for_gmail.consumer_key,
      configatron.gapps.oauth.for_gmail.consumer_secret,
      site:             'https://accounts.google.com',
      authorize_url:    '/o/oauth2/auth',
      access_token_url: '/o/oauth2/token',
      parse_json:       true
    )
    @@client    
  end

  # Erase current OAuth2::Client
  # only useful for test purpose for now
  #
  def self.client=(value)
    @@client = value
  end

end

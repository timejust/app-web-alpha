# encoding: utf-8
class Google::Request
  cattr_accessor :format
  cattr_accessor :version
  @@format = 'application/json'
  @@version = '2'

  # Return request headers
  #
  # @return [Hash]
  #
  def self.headers
    {'Content-Type' => self.format, 'GData-Version' => self.version}
  end

  # Perform POST request
  #
  # @param [OAuth2::AccessToken]  access_token
  # @param [String]               url
  # @param [Hash]                 params
  #
  # @return [JSON]
  #
  def self.post(access_token, url, params)
    self.request(:post, access_token, url, self.format_params(params))
  end

  # Perform PUT request
  #
  # @param [OAuth2::AccessToken]  access_token
  # @param [String]               url
  # @param [Hash]                 params
  #
  # @return [JSON]
  #
  def self.put(access_token, url, params)
    self.request(:put, access_token, url, self.format_params(params))
  end

  # Perform DELETE request
  #
  # @param [OAuth2::AccessToken]  access_token
  # @param [String]               url
  # @param [Hash]                 params
  #
  # @return [JSON]
  #
  def self.delete(access_token, url, params = {})
    self.request(:delete, access_token, self.format_url(url), params, self.headers.merge('If-Match' => '*'))
  end

  # Perform GET request
  #
  # @param [OAuth2::AccessToken]  access_token
  # @param [String]               url
  # @param [Hash]                 params
  #
  # @return [JSON]
  #
  def self.get(access_token, url, params = {})
    self.request(:get, access_token, self.format_url(url), params)
  end

  # Perform request
  #
  # @param [Symbol]               method
  # @param [OAuth2::AccessToken]  access_token
  # @param [String]               url
  # @param [Hash]                 params
  #
  # @return [JSON]
  #
  def self.request(method, access_token, url, params, headers = self.headers)
    begin
      access_token.send(
        method,
        url,
        params,
        headers
      )
    rescue OAuth2::HTTPError => e
      Rails.logger.error '========== Error making Google request =========='
      Rails.logger.error 'Request :'
      Rails.logger.error method
      Rails.logger.error url
      Rails.logger.error params
      Rails.logger.error headers
      Rails.logger.error 'Response :'
      Rails.logger.error e.response.body
      Rails.logger.error e.response.status
      Rails.logger.error '================================================='
      return e.response.body
    end
  end


  # Format url to add alt=jsonc for get requests
  #
  # @param [String]   url
  #
  # @return [String]
  #
  def self.format_url(url)
    if self.format == "application/json"
      url + "?alt=jsonc"
    else
      url
    end
  end

  # Format params for current format
  #
  # @param [Hash]   params
  #
  # @return [String]  JSON or XML
  #
  def self.format_params(params)
    case self.format
    when "application/json"
      {data: params}.to_json
    when "application/atom+xml"
      raise Google::Request::NotImplementedFormat
    else
      raise Google::Request::NotImplementedFormat
    end
  end
end

class Google::Request::NotImplementedFormat < Exception
end


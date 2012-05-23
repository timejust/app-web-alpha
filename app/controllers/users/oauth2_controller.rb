# encoding: utf-8
require 'google/api_client'

class Users::Oauth2Controller < ApplicationController  
  before_filter :initialize_client
  
  def initialize_client
    @client = Google::APIClient.new  
    @client.authorization.client_id = configatron.gapps.oauth.for_gmail.consumer_key
    @client.authorization.client_secret = configatron.gapps.oauth.for_gmail.consumer_secret
    @client.authorization.scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly https://www.google.com/calendar/feeds'
    @client.authorization.redirect_uri = oauth2_callback_url  
    # Rails.logger.info @client.inspect
  end
  
  def callback
    # If there is an error accespting Timejust app, return to failure
    redirect_to oauth2_failure_path and return if params[:error]
        
    # get access token
    @client.authorization.code = params[:code]
    @client.authorization.fetch_access_token!
    
    # fetch email
    oauth2 = @client.discovered_api('oauth2', 'v2')    
    result = @client.execute oauth2.userinfo.get
    response = result.response

    # Rails.logger.info response.status
    # If the request is not success, return to failure
    redirect_to oauth2_failure_path and return if response.status != 200    
    email = result.data['email']
    
    # Rails.logger.info @client.authorization.inspect    
    # Create/Update user informations
    user = User.find_or_initialize_by(:email => email)
    refresh_token = user.refresh_token
    if @client.authorization.refresh_token != ''
      refresh_token = @client.authorization.refresh_token
    end
    user.update_attributes(
      :token => @client.authorization.access_token,
      :refresh_token => refresh_token,
      :token_expires_at => @client.authorization.expires_in,
      :expired => 0
    )

    # Sign in user
    sign_in(:user, user)
    
    if !(session[:Haddress].blank? || session[:Hlat].blank? || session[:Hlng].blank?)
      add_alias(user, Home, session[:Haddress], session[:Hlat], session[:Hlng])
    end
    
    if !(session[:Waddress].blank? || session[:Wlat].blank? || session[:Wlng].blank?)
      add_alias(user, Work, session[:Waddress], session[:Wlat], session[:Wlng])
    end
    
    current_user.set_google_api_client(@client)
    calendars = current_user.find_or_create_calendars

    if calendars.is_a?(Hash) && calendars['error'] && calendars['error']['code'] == 403 &&
      calendars['error']['errors'].any?{|error| error['code'] == "ServiceForbiddenException"}
      redirect_to oauth2_failure_path(reason: 'user_has_no_calendar') and return
    end

    Resque.enqueue(GoogleCalendarSync, current_user.email)      
    # user.google_calendar_sync
    calendar_url = "https://www.google.com/calendar/render?gadgeturl=#{configatron.gadget.url}?auth_token=#{current_user.authentication_token}&#{Rails.env}=#{Time.now.to_i}"
    
    # redirect_to session[:return_to]||root_path
    redirect_to calendar_url
  end

  def failure
    @reason = params[:reason]||'unauthorized'
  end
  
  def add_alias(user, title, address, lat, lng)
    favorite = FavoriteLocation.find_or_initialize_by(user_id: user.id, title: title)
    favorite.address = address
    favorite.lat = lat
    favorite.lng = lng
    favorite.save
  end

  def authorize
    session[:return_to] = params[:return_to]||nil
    session[:Haddress] = params[:Haddress]||nil
    session[:Hlat] = params[:Hlat]||nil
    session[:Hlng] = params[:Hlng]||nil
    session[:Waddress] = params[:Waddress]||nil
    session[:Wlat] = params[:Wlat]||nil
    session[:Wlng] = params[:Wlng]||nil
    redirect_to @client.authorization.authorization_uri.to_s, :status => 303    
  end
end

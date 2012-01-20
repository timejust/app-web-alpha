# encoding: utf-8
class Users::Oauth2Controller < ApplicationController

  def callback
    # If there is an error accespting Timejust app, return to failure
    redirect_to oauth2_failure_path and return if params[:error]

    # get access token
    @access_token = OAuthHelper.client.web_server.get_access_token(
      params[:code],
      :redirect_uri => oauth2_callback_url
    )

    # fetch email
    email = @access_token.get("https://www.googleapis.com/userinfo/email?alt=json")['data']['email']

    #Rails.logger.info(@access_token.inspect)
    
    # Create/Update user informations
    user = User.find_or_initialize_by(:email => email)
    user.update_attributes(
      :token => @access_token.token,
      :refresh_token => @access_token.refresh_token,
      :token_expires_at => @access_token.expires_at,
      :expired => 0
    )

    # Sign in user
    sign_in(:user, user)

    calendars = current_user.find_or_create_calendars

    if calendars.is_a?(Hash) && calendars['error'] && calendars['error']['code'] == 403 &&
      calendars['error']['errors'].any?{|error| error['code'] == "ServiceForbiddenException"}
      redirect_to oauth2_failure_path(reason: 'user_has_no_calendar') and return
    end

    redirect_to session[:return_to]||root_path
  end

  def failure
    @reason = params[:reason]||'unauthorized'
  end

  def authorize
    session[:return_to] = params[:return_to]||nil
    redirect_to OAuthHelper.client.web_server.authorize_url(
      :redirect_uri => oauth2_callback_url,
      :scope => "https://www.googleapis.com/auth/userinfo#email https://www.google.com/calendar/feeds/"
    ), :status => 303
  end
end

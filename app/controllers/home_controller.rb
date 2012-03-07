class HomeController < ApplicationController

  def index
    if user_signed_in? and current_user != nil
      redirect_to "https://www.google.com/calendar/render?gadgeturl=#{configatron.gadget.url}?auth_token=#{current_user.authentication_token}&#{Rails.env}=#{Time.now.to_i}"
    end
  end

end

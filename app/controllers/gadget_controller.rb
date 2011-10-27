class GadgetController < ApplicationController
  layout nil
  before_filter :authenticate_user!


  # TODO : specs
  def show
    if configatron.api.basic_auth.user.is_a?(String) && configatron.api.basic_auth.password.is_a?(String)
      @basic_auth = "'#{ActiveSupport::Base64.encode64("#{configatron.api.basic_auth.user}:#{configatron.api.basic_auth.password}").chomp}'"
    else
      @basic_auth = 'null';
    end
  end

end

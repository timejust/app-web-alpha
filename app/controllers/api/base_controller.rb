class Api::BaseController < ActionController::Base
  rescue_from OAuth2::AccessDenied, :with => :unauthorized!

  def unauthorized!
    render :nothing => true, :status => :unauthorized
  end
end

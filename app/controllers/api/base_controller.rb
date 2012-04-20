class Api::BaseController < ActionController::Base
  rescue_from OAuth2::Error, :with => :unauthorized!
  # before_filter :read_geo_ip_headers
  
  def read_geo_ip_headers
    Rails.logger.info "**#{request.env["HTTP_CITY"]},#{request.env["HTTP_COUNTRYNAME"]},#{request.env["HTTP_LATITUDE"]},#{request.env["HTTP_LONGITUDE"]}**"        
  end
  
  def unauthorized!
    render :nothing => true, :status => :unauthorized
  end
end

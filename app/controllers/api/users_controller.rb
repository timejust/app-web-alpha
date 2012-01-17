class Api::UsersController < Api::BaseController
  skip_before_filter :verify_authenticity_token
  before_filter :authenticate_user!

  # GET /v1/users/status
  # Return a status for the given user
  #
  # Return status indicate :
  #  * 404 : User not found
  #  * 204 : User has no pending events
  #  * 200 : User has a pending event
  #  * 401 : USer has not authorize timejust to access calendar
  #
  # @param [String]   email, email of the user
  #
  # @return [JSON]    JSON representation of an Event if any pending
  #         [Nothing] if user not found or no pending event
  #
  def status
    if User.exists?(conditions: {email: params[:email]})
      user = User.where(email: params[:email]).first
      return unauthorized! if current_user != user
      user.find_or_create_calendars
      if user.has_pending_events?
        @event = user.last_pending_event
        render :json => @event.to_json, :status => :ok
      else
        render :nothing => true, :status => :no_content
      end
    else
      render :nothing => true, :status => :not_found
    end
  end

  # PUT /v1/users/purge_travels
  #
  # Purge all waiting travel proposals
  #
  def purge_travels
    current_user.purge_travels
    render :json => current_user.to_json, :status => :accepted
  end

  # GET /v1/users/alias
  #
  def alias
    if User.exists?(conditions: {email: params[:email]})
      user = User.where(email: params[:email]).first
      return unauthorized! if current_user != user
                
      locations = FavoriteLocation.find(:all, :conditions => { :user_id => user[:_id] })
      render :json => locations.to_json, :status => :ok
    else
      render :nothing => true, :status => :not_found
    end    
  end
  
  # POST /v1/users/alias
  #
  def add_alias
    if User.exists?(conditions: {email: params[:email]})
      user = User.where(email: params[:email]).first
      return unauthorized! if current_user != user
      
      FavoriteLocation.create(:user => user, 
        :title => params[:title], :address => params[:address], 
        :lat => params[:lat], :lng => params[:lng]);
    else
    end
  end
end

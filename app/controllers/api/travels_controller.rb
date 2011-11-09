class Api::TravelsController < Api::BaseController
  skip_before_filter :verify_authenticity_token
  before_filter :authenticate_user!
  before_filter :load_travel
  before_filter :require_travel_owner!

  # DELETE /v1/travels/:id
  #
  # Destroy travel and associated google events
  #
  def destroy
    @travel.destroy
    render :json => @travel.to_json, :status => :no_content
  end

  # PUT /v1/travels/:id/confirm
  #
  # Confirm a travel, copy it to user calendar
  # and remove it from shared calendar
  #
  def confirm
    @travel.confirm
    render :json => @travel.to_json, :status => :no_content
  end

  # PUT /v1/travels/:id/bookmark
  #
  # Bookmark a travel, it will not be purge later
  #
  def bookmark
    @travel.bookmark
    render :json => @travel.to_json, :status => :no_content
  end

  private

  # Load event by id
  def load_travel
    @travel = Travel.find(params[:id])
  end

  def require_travel_owner!
    unauthorized! if @travel.event.user != current_user
  end

end

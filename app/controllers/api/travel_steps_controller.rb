class Api::TravelStepsController < Api::BaseController
  skip_before_filter :verify_authenticity_token
  before_filter :authenticate_user!
  before_filter :load_travel_step
  before_filter :require_travel_step_owner!

  # DELETE /v1/travel_steps/:id
  #
  # Destroy travel_step and associated google events
  #
  def destroy
    @travel_step.destroy
    render :json => @travel_step.to_json, :status => :no_content
  end

  # PUT /v1/travel_steps/:id/confirm
  #
  # Confirm a travel_step, copy it to user calendar
  # and remove it from shared calendar
  #
  def confirm
    @travel_step.confirm
    render :json => @travel_step.to_json, :status => :no_content
  end

  # PUT /v1/travel_steps/:id/bookmark
  #
  # Bookmark a travel_step, it will not be purge later
  #
  def bookmark
    @travel_step.bookmark
    render :json => @travel_step.to_json, :status => :no_content
  end

  private

  # Load event by id
  def load_travel_step
    @travel_step = TravelStep.find(params[:id])
  end

  def require_travel_step_owner!
    unauthorized! if @travel_step.event.user != current_user
  end

end

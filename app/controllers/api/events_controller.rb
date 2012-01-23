class Api::EventsController < Api::BaseController
  skip_before_filter :verify_authenticity_token
  before_filter :authenticate_user!
  before_filter :load_event,            except: [:create]
  before_filter :require_event_owner!,  except: [:create]

  # POST /v1/events
  #
  # Push an event to workers
  #
  # @param    [String]  email, email of the user
  # @param    [JSON]    event, JSON representation of a Google Calendar event
  #
  # @return   [JSON]    JSON representation of event
  #
  def create
    if params[:event]
      timer = Timejust::LatencySniffer.new('Event:create')
      timer.start()      
      
      Resque.enqueue(GoogleCalendarCreator, current_user.email)      
      @event = Event.parse_from_google_gadget(params[:event])
      @event.base = params[:base]
      
      Rails.logger.info("the request came from #{params[:current_ip]}")
      @event.create_previous_travel_node(params[:previous_travel_node]) if params[:previous_travel_node] && params[:previous_travel_node][:address].present?
      @event.create_current_travel_node(params[:current_travel_node]) if params[:current_travel_node] && params[:current_travel_node][:address].present?      
      @event.set_current_ip(params[:current_ip])            
      @event.created_at = Time.now
      @event.user = current_user
      if @event.save
        if current_user.expired == 1
          render :nothing => true, :status => :unauthorized
        else
          render :json => @event, :status => :created
        end
      else
        render :json => @event.errors, :status => :unprocessable_entity
      end
      timer.end()
    else
      render :nothing => true, :status => :unprocessable_entity
    end
  end

  # PUT /v1/events/:id/add_google_info
  #
  # Add Google info to event from GData API
  #
  # @param    [Integer]   id, the event id
  #
  # @return   [JSON]      JSON representation of event
  #
  # @deprecated, done in workers
  #
  def add_google_info
    @event.add_google_info(@event.user.access_token)
    if @event.save
      render :json => @event, :status => :ok
    else
      render :json => @event.errors, :status => :unprocessable_entity
    end
  end

  # GET /v1/events/:id/travel_nodes
  #
  # Get travel nodes proposals for user confirmation
  # If not already performed, return 404
  # if not waiting and not travel_nodes_progress, return 410 to stop polling
  #
  # @param    [Integer]   id, the event id
  #
  # @return   [JSON]      JSON representation of event with its travel nodes
  #
  def travel_nodes
    if @event.travel_nodes_done?
      render :json => @event.to_json, :status => :ok
    elsif @event.waiting? || @event.travel_nodes_progress?
      render :nothing => true, :status => :not_found
    else
      render :nothing => true, :status => :gone
    end
  end

  # POST /v1/events/:id/travel_nodes_confirmation
  #
  # Push travel nodes confirmation to event
  #
  # @param  [String]  previous_travel_node
  # @param  [String]  current_travel_node
  # @param  [String]  next_travel_node 
  #
  # @return [JSON]    JSON representation of event
  #
  def travel_nodes_confirmation
    @event.set_current_ip(params[:current_ip])
    @event.create_previous_travel_node(params[:previous_travel_node]) if params[:previous_travel_node] && params[:previous_travel_node][:address].present?
    @event.create_current_travel_node(params[:current_travel_node]) if params[:current_travel_node] && params[:current_travel_node][:address].present?
    # @event.create_next_travel_node(params[:next_travel_node]) if params[:next_travel_node] && params[:next_travel_node][:address].present?
    @event.save
    @event.wait
    # @event.check_for_favorite_locations
    render :json => @event, :status => :ok
  end

  # GET /v1/events/:id/travels
  #
  # Get travels proposals
  # If not already performed, return 404
  #
  # @param    [Integer]   id, the event id
  #
  # @return   [JSON]      JSON representation of event with its travels
  #
  def travels
    if @event.travels_to_calendar_waiting?
      if current_user.expired == 1
        render :nothing => true, :status => :unauthorized
      else
        render :json => @event.to_json, :status => :ok
      end
    elsif @event.canceled?
      render :nothing => true, :status => :gone
    else
      render :nothing => true, :status => :not_found
    end
  end

  # GET /v1/events/:id/calendars
  #
  # Notify which adding items to Google Calendars has been done.
  #
  def calendars
    if @event.travels_done?
      if current_user.expired == 1
        render :nothing => true, :status => :unauthorized
      else
        render :json => @event.to_json, :status => :ok
      end
    elsif @event.canceled?
      render :nothing => true, :status => :gone
    else
      render :nothing => true, :status => :not_found
    end
  end
  
  # PUT /vi/events/:id/cancel
  #
  # Cancel an event
  #
  # @param    [Integer]   id, the event id
  #
  # @return   [JSON]      JSON representation of event
  #
  def cancel
    if @event.cancel
      render :json => @event.to_json, :status => :ok
    else
      render :nothing => true, :status => :unprocessable_entity
    end
  end
  
  # POST /v1/events/:id/write_to_calendar
  # Write travels events to Google Calendar
  #
  # @param    [Integer]   id, the event id
  #
  # @return   [JSON]      JSON representation of event
  #
  # @deprecated, done in workers
  #
  def write_travels_to_calendar
    @event.write_travels_to_calendar
    render :json => @event.to_json, :status => :ok
  end

  # GET /v1/events/:id/around
  # Return all events around the currrent event
  # Offset can be defined to set number of days interval
  #
  # @param    [Integer]   offset, optional, default 1
  #
  # @return   [JSON]      JSON respresentation of an event collection
  #
  # @deprecated, done in workers
  #
  def around
    params[:offset] ||= 1
    events = @event.around_events(params[:offset])
    render :json => events.to_json, :status => :ok
  end

  private

  # Load event by id
  def load_event
    @event = Event.find(params[:id])
  end

  def require_event_owner!
    unauthorized! if @event.user != current_user
  end

end

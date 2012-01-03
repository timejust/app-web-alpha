App.Views.EventView = Backbone.View.extend({
  events: {
    'click .get_there'  : 'getThere',
    'click .leave_from'  : 'leaveFrom',
    'click .clear'          : 'clear'
  },
  initialize: function(){
    this.selectedEvent = undefined;
    _.bindAll(this, 'calendarEventOccured');
    _.bindAll(this, 'generateTripCallback');
    _.bindAll(this, 'error');
    this.ip = this.options.ip
    // Bind event on calendar event click
    google.calendar.read.subscribeToEvents(this.calendarEventOccured);
    this.showButton = true;
    this.base = "departure";
    this.render();
  },
  template: _.template('\
    <p class="title"><%= title %></p>\
    <p class="location"><%= location %></p>\
    <ul class="schedule">\
      <li class="event_date"></li>\
      <li><%= $.format.date(google.calendar.utils.toDate(startTime), App.config.dateOnly) %></li>\
      <li class="event_time"></li>\
      <li><%= $.format.date(google.calendar.utils.toDate(startTime), App.config.time) %></li>\
    </ul>\
    <p class="gt_button"><a href="#" class="get_there">GET THERE !</a></p>\
    <p class="gt_button"><a href="#" class="leave_from">LEAVE FROM !</a></p>\
  '),
  without_template: _.template('\
    <p class="title"><%= title %></p>\
    <p class="location"><%= location %></p>\
    <ul class="schedule">\
      <li class="event_date"></li>\
      <li><%= $.format.date(google.calendar.utils.toDate(startTime), App.config.dateOnly) %></li>\
      <li class="event_time"></li>\
      <li><%= $.format.date(google.calendar.utils.toDate(startTime), App.config.time) %></li>\
    </ul>\
    <p></p>\
  '),
  // Calendar event was clicked, store and display it
  calendarEventOccured: function(calendarEvent){
    if (calendarEvent && calendarEvent['id']) {
      // don't use event from proposals calendars
      if(!App.config.calendar_names || $.inArray(calendarEvent['calendar']['name'], App.config.calendar_names) == -1) {
        this.selectedEvent = calendarEvent;
        this.showButton = true;
        if (this.travels_view) {
          this.travels_view.clear();
        }
      }
    }
    this.render();
  },
  leaveFrom: function(event){
    this.base = "departure";
    this.generateTrip(event);
  },
  getThere: function(event){
    this.base = "arrival";
    this.generateTrip(event);
  },
  // Launch request to API to create event in database
  // If it was created successfully, show travel nodes selector view
  generateTrip: function(event){    
    event.preventDefault();
    showLoader();
    
    // TODO : use Event model and bind callback on created event
    GoogleRequest.post({
      url: App.config.api_url + "/events",
      params: {
        event: JSON.stringify($.extend(
          this.selectedEvent,
          {
            before_start_time: 0,
            after_end_time: 0           
          }
        )),
        current_ip: this.ip,
        base: this.base
      },
      success: this.generateTripCallback,
      error: this.error
    });
  },
  // Callback when an event is created
  generateTripCallback: function(response){
    if (response.data) {
      this.model = new App.Models.Event(response.data);
    }
    hideLoader();
    google.calendar.refreshEvents();
    this.showTravelNodesSelector();
  },
  // Show travel nodes selector view to confirm each travel nodes addresses
  // Also start polling from API to get travels proposals
  showTravelNodesSelector: function(){
    gadgets.views.requestNavigateTo('canvas', { apiEventId: this.model.get('_id'), base: this.base });
    if (this.travels_view) {
      this.travels_view.clear();
      this.travels_view.apiEventId = this.model.get('_id');
      this.travels_view.selectedEvent = this.selectedEvent;
      this.travels_view.ip = this.ip;
      this.travels_view.eventView = this;
      this.travels_view.waitForTravels();
      this.travels_view.base = this.base;
    }
    else{
      this.travels_view = new App.Views.TravelsView({ el: $('#travels').get(0), apiEventId: this.model.get('_id'), selectedEvent: this.selectedEvent, ip: this.ip, eventView: this, base: this.base });
    }
  },
  // Render the selected Event in gadget sidebar
  render: function(){
    if (this.selectedEvent){
      if (this.showButton == true)
        $(this.el).html(this.template(this.selectedEvent));
      else
        $(this.el).html(this.without_template(this.selectedEvent));
    }
    else{
      $(this.el).html("<p class=\"title\">Select an event</p>");
    }
    gadgets.window.adjustHeight();
  },
  error: function(response){
    hideLoader();
    this.$('.error').remove();
    if (response.rc == 401) {
      $(this.el).append("<div class='error'>You must authorize Timejust to access your calendar by clicking : <a href='" + App.config.web_url + "/oauth2/authorize?return_to=http://google.com/calendar' target='blank'>here</a></div>");
    }
    else{
      $(this.el).append('<div class="error">An error occurred when calculating your route, please try again</div>');
    }
    gadgets.window.adjustHeight();
  },
  // TODO spec
  clear: function(event){
    event.preventDefault();
    showLoader();
    var self = this;
    app.user.purgeTravels({
      success: function(){
        google.calendar.refreshEvents();
        self.selectedEvent = undefined;
        self.render();
        if(self.travels_view) {
          self.travels_view.clear();
        }
        gadgets.window.adjustHeight();
        hideLoader();
      },
      error: function(){
        hideLoader();
      }
    });
  }
});

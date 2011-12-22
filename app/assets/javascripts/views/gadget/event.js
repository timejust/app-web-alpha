App.Views.EventView = Backbone.View.extend({
  events: {
    'click .generate_trip'  : 'generateTrip',
    'click .clear'          : 'clear'
  },
  initialize: function(){
    this.selectedEvent = undefined;
    _.bindAll(this, 'calendarEventOccured');
    _.bindAll(this, 'generateTripCallback');
    _.bindAll(this, 'error');
    // Bind event on calendar event click
    google.calendar.read.subscribeToEvents(this.calendarEventOccured);
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
    <p class="gt_button"><a href="#" class="generate_trip">GET THERE !</a></p>\
  '),
  // Calendar event was clicked, store and display it
  calendarEventOccured: function(calendarEvent){
    if (calendarEvent && calendarEvent['id']) {
      // don't use event from proposals calendars
      if(!App.config.calendar_names || $.inArray(calendarEvent['calendar']['name'], App.config.calendar_names) == -1) {
        this.selectedEvent = calendarEvent;
      }
    }
    this.render();
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
            after_end_time: 0,
            // before_start_time: this.$('select[name=before_offset]').val(),
            // after_end_time: this.$('select[name=after_offset]').val(),            
          }
        )),
        current_ip: this.options.ip
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
    gadgets.views.requestNavigateTo('canvas', { apiEventId: this.model.get('_id') });
    if (this.travels_view) {
      this.travels_view.clear();
      this.travels_view.apiEventId = this.model.get('_id');
      this.travels_view.waitForTravels();
    }
    else{
      this.travels_view = new App.Views.TravelsView({ el: $('#travels').get(0), apiEventId: this.model.get('_id') });
    }
  },
  // Render the selected Event in gadget sidebar
  render: function(){
    if (this.selectedEvent){
      $(this.el).html(this.template(this.selectedEvent));
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

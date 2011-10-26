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
    <p class="timefromto"><%= $.format.date(google.calendar.utils.toDate(startTime), App.config.time) %> - <%=  $.format.date(google.calendar.utils.toDate(endTime), App.config.time) %></p>\
    <p class="before_offset">Arrive <select name="before_offset">\
      <% $.each([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60], function(index, i){ %>\
        <option value="<%= i %>" <% if (i==10){ %>selected<% } %>><%= i %> \'</option>\
      <% }); %>\
    </select> before <%= $.format.date(google.calendar.utils.toDate(startTime), App.config.time) %></p>\
    <p class="after_offset">Leave <select name="after_offset">\
      <% $.each([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60], function(index, i){ %>\
        <option value="<%= i %>" <% if (i==15){ %>selected<% } %>><%= i %> \'</option>\
      <% }); %>\
    </select> after <%= $.format.date(google.calendar.utils.toDate(endTime), App.config.time) %></p>\
    <p><a href="#" class="generate_trip">Generate Trip</a> | <a href="#" class="clear">Clear</a></p>\
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
            before_start_time: this.$('select[name=before_offset]').val(),
            after_end_time: this.$('select[name=after_offset]').val()
          }
        ))
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
    $('#travels').empty();
    new App.Views.TravelsView({ el: $('#travels').get(0), apiEventId: this.model.get('_id') });
  },
  // Render the selected Event in gadget sidebar
  render: function(){
    if (this.selectedEvent){
      $(this.el).html(this.template(this.selectedEvent));
    }
    else{
      $(this.el).html("No event selected");
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
        $('#travels').html("");
        gadgets.window.adjustHeight();
        hideLoader();
      },
      error: function(){
        hideLoader();
      }
    })
  }
});

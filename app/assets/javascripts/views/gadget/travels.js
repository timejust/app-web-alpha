// Show travels and refresh calendar
App.Views.TravelsView = Backbone.View.extend({
  className: 'travels',
  events: {
    'click .load_previous_travel' : 'generatePreviousTravel',
    'click .load_next_travel'     : 'generateNextTravel',    
    'click .travel_node_toggle'   : 'toggleTravelNode',
    'click .white_toggle'         : 'whiteToggleSteps',
    'click .gray_toggle'          : 'grayToggleSteps',
    'click .yellow_toggle'        : 'yellowToggleSteps',
    'click .green_toggle'         : 'greenToggleSteps',
    'click .pink_toggle'          : 'pinkToggleSteps',
    'click .show_travel_node'     : 'generateTrip',
    'click .value'                : 'changeTitle'
  },
  initialize: function(){
    showLoader();
    _.bindAll(this, 'waitForTravels');
    // _.bindAll(this, 'generateTripCallback');    
    gadgets.window.adjustHeight();
    // this.base = this.options.base;
    this.ip = this.options.ip;    
    this.eventView = this.options.eventView;
    this.summaries = new Array();    
    this.previousEventView = new App.Views.EventSummaryView({prefix: "from"});
    this.currentEventView = new App.Views.EventSummaryView();
    this.nextEventView = new App.Views.EventSummaryView({prefix: "to"});  
    this.previousTravelView = new App.Views.TravelView();
    this.nextTravelView = new App.Views.TravelView();
    this.travelType = 'previous';      
  },
  appendEventSummary: function(i, summary) {
    this.summaries[i] = summary;
  },
  waitForTravels: function(response){
    google.calendar.refreshEvents();
    this.apiEventId = response.data._id;
    var self = this;    
    // Start polling for Travel proposals
    $.poll(function(retry){
      GoogleRequest.get({
        url: App.config.api_url + "/events/" + self.apiEventId + "/travels?nocache=" + new Date().getTime(),
        // TODO spec
        success: function(response){
          self.handleTravelResponse(response, retry);
        },
        // TODO spec
        error: function(response){
          self.handleTravelResponse(response, retry);
        }
      });
    });
  },
  // handle travel proposals response
  // if status is a 404, continue
  // if 410, stop, event was canceled
  // if 200, show travel proposals
  handleTravelResponse: function(response, retry){
    if (response.rc == 404) {
      showLoader();
      retry();
    }
    else if (response.rc == 410) {
      hideLoader();
      this.model = null;
    }
    else if (response.rc == 200) {
      hideLoader();
      var travelView = null;      
      if (this.travelType == 'previous') {
        travelView = this.previousTravelView;
      } else {
        travelView = this.nextTravelView;
      }      
      travelView.model = response.data;
      travelView.render();  
      gadgets.window.adjustHeight();  
      google.calendar.refreshEvents();  
    }
  },
  generatePreviousTravel: function(event) {
    this.travelType = 'previous';
    this.base = 'arrival';
    this.generateTrip(event);
  },
  generateNextTravel: function(event) {
    this.travelType = 'next';
    this.base = 'departure';
    this.generateTrip(event);
  },
  // Launch request to API to create event in database
  // If it was created successfully, show travel nodes selector view
  generateTrip: function(event){
    event.preventDefault();
    showLoader();    
    gadgets.window.adjustHeight();        
    var from = null;
    var to = null;
    if (this.travelType == 'previous') {
      from = this.previousEventView;
      to = this.currentEventView;
    } else {
      from = this.currentEventView;
      to = this.nextEventView;
    }    
    // TODO : use Event model and bind callback on created event
    GoogleRequest.post({
      url: App.config.api_url + "/events",
      params: {
        event: JSON.stringify($.extend(
          this.selectedEvent,
          {
            before_start_time: 0,
            after_end_time: 0,            
          }          
        )),
        current_ip: this.ip,        
        base: this.base,
        'previous_travel_node[address]': from.address,
        'previous_travel_node[title]': from.title,
        'previous_travel_node[state]': 'confirmed',
        'previous_travel_node[event_google_id]': from.summary.googleEventId,
        'previous_travel_node[lat]' : from.lat,
        'previous_travel_node[lng]' : from.lng,
        'previous_travel_node[has_normalized]' : '1',
        'current_travel_node[address]': to.address,
        'current_travel_node[title]': to.title,
        'current_travel_node[state]': 'confirmed',
        'current_travel_node[event_google_id]': to.summary.googleEventId,
        'current_travel_node[lat]' : to.lat,
        'current_travel_node[lng]' : to.lng,
        'current_travel_node[has_normalized]' : '1',
      },
      success: this.waitForTravels,
      error: this.error
    });
  },
  /*
  // Launch request to API to create event in database
  // If it was created successfully, show travel nodes selector view
  generateTripWithoutAddress: function() {    
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
  },
  */
  render: function() {
    var self = this;
    $(this.el).html("\
    <div class='transportations'></div>\
    <div id='previous_event'></div>\
    <div id='previous_travel'></div>\
    <a class='load_previous_travel' href='#'><div class='green_btn'><div class='button_name'>PLAN THIS TRIP</div></div></a>\
    <div id='current_event'></div>\
    <div id='next_travel'></div>\
    <a class='load_next_travel' href='#'><div class='green_btn'><div class='button_name'>PLAN THIS TRIP</div></div></a>\
    <div id='next_event'></div>\
    ");
    this.previousEventView.el = $('#previous_event').get(0);
    this.previousEventView.summary = this.summaries[0];
    this.currentEventView.el = $('#current_event').get(0);
    this.currentEventView.summary = this.summaries[1];
    this.nextEventView.el = $('#next_event').get(0);
    this.nextEventView.summary = this.summaries[2];
    this.previousTravelView.el = $('#previous_travel').get(0);
    this.nextTravelView.el = $('#next_travel').get(0);
    
    this.previousEventView.render();
    this.currentEventView.render();
    this.nextEventView.render();    
    
    $(this.el).html();    
    gadgets.window.adjustHeight();
    google.calendar.refreshEvents();
  },
  // TODO spec
  toggleTravelNode: function(e){
    e.preventDefault();
    $(e.currentTarget).toggleClass('on');
    $(e.currentTarget).toggleClass('off');
    $(e.currentTarget).siblings('.travel_node_expand').toggle();
    gadgets.window.adjustHeight();
  },
  whiteToggleSteps: function(e) {
    e.preventDefault();
    this.$('.gray').toggle();
    this.$('.white_toggle').toggleClass('on');
    this.$('.white_toggle').toggleClass('off');    
  },
  toggleText: function(el, limit) {
    if (el.attr('shorten') == 'true') {
      el.html(el.attr('original'));
      el.attr('shorten', 'false');
    } else {
      var text = el.attr('original');
      text = text.substring(0, limit);
      if (el.attr('original').length > limit) 
        text += "...";
      el.html(text);          
      el.attr('shorten', 'true');
    }
  },
  toggleHideText: function(el, limit) {
    if (el.attr('shorten') == 'true') {
      el.html('');
      el.attr('shorten', 'false');
    } else {
      var text = el.attr('original');
      text = text.substring(0, limit);
      if (el.attr('original').length > limit) 
        text += "...";
      el.html(text);          
      el.attr('shorten', 'true');
    }
  },
  currentEvent: function(root) {
    if (root[0].id == 'previous_event') {
      event = this.previousEventView;
    } else if (root[0].id == 'current_event') {
      event = this.currentEventView;
    } else if (root[0].id == 'next_event') {
      event = this.nextEventView;
    }
    return event;
  },
  grayToggleSteps: function(e) {
    e.preventDefault();    
    var root = $(e.currentTarget).parent('li').parent('ul').parent('div').parent('div');
    var container = $(e.currentTarget).parent('li').parent('ul').find('.aliases');
    $(e.currentTarget).toggleClass('on');
    $(e.currentTarget).toggleClass('off');    
    var title = $(e.currentTarget).parent('li').parent('ul').find('.title');
    var address = $(e.currentTarget).parent('li').parent('ul').find('.address');    
    this.toggleText(title, 23);
    this.toggleHideText(address, 21);
    container.toggle();
    gadgets.window.adjustHeight();
  },
  changeTitle: function(e) {
    e.preventDefault();    
    var el = $(e.currentTarget);
    var container = el.parent('li').parent('.aliases');    
    if (el.attr('selector') == 'true') {
      // Go to address selector page.
      // this.generateTripWithoutAddress();
    } else {
      var root = container.parent('ul').parent('div').parent('div');    
      var event = this.currentEvent(root);
      event.selected = el.attr('id');
      event.render();
    }    
  },  
  yellowToggleSteps: function(e) {
    e.preventDefault();    
    var container = $(e.currentTarget).parent('li').parent('ul').parent('div').find('.steps');
    $(e.currentTarget).toggleClass('on');
    $(e.currentTarget).toggleClass('off');
    container.toggle();
    gadgets.window.adjustHeight();
  },
  greenToggleSteps: function(e) {
    e.preventDefault();    
    var container = $(e.currentTarget).parent('li').parent('ul').parent('div').find('.steps');
    $(e.currentTarget).toggleClass('on');
    $(e.currentTarget).toggleClass('off');
    container.toggle();
    gadgets.window.adjustHeight();
  },
  pinkToggleSteps: function(e) {
    e.preventDefault();    
    var container = $(e.currentTarget).parent('li').parent('ul').parent('div').find('.steps');
    $(e.currentTarget).toggleClass('on');
    $(e.currentTarget).toggleClass('off');
    container.toggle();
    gadgets.window.adjustHeight();
  },
  clear: function(){
    $(this.el).empty();
  }
});

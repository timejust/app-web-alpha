// Show travels and refresh calendar
App.Views.TravelsView = Backbone.View.extend({
  className: 'travels',
  events: {
    'click .load_previous_travel' : 'generatePreviousTravel',
    'click .load_next_travel'     : 'generateNextTravel',    
    'click .white_toggle'         : 'whiteToggleSteps',
    'click .gray_toggle'          : 'grayToggleSteps',
    'click .yellow_toggle'        : 'toggleSteps',
    'click .green_toggle'         : 'toggleSteps',
    'click .pink_toggle'          : 'toggleSteps',
    'click .value'                : 'changeTitle',
    'click .top'                  : 'toggleEvent',
    'poll #event_polling'         : 'handleEvent'
  },
  initialize: function(){
    showLoader();
    _.bindAll(this, 'waitForTravels');
    _.bindAll(this, 'handleEvent'); 
    gadgets.window.adjustHeight();
    this.ip = this.options.ip;    
    this.eventView = this.options.eventView;
    this.summaries = new Array();    
    this.previousEventView = new App.Views.EventSummaryView({prefix: "from", stage: 'previous'});
    this.currentEventView = new App.Views.EventSummaryView({stage: 'current'});
    this.nextEventView = new App.Views.EventSummaryView({prefix: "to", stage: 'next'});  
    this.previousTravelView = new App.Views.TravelView();
    this.nextTravelView = new App.Views.TravelView();
    this.travelType = 'previous';      
  },
  appendEventSummary: function(i, summary) {
    this.summaries[i] = summary;
  },
  handleEvent: function(e) {
    var self = this;
    $.poll(function(retry) {
      var ev = $.cookie('event');    
      if (ev == null || ev == "") {
        retry();
      } else {  
        ev = eval('(' + ev + ')');      
        if (ev.type == 'EVENT_ADDRESS_SELECTED') {
          self.onAddressSelected(ev.params);
        } else if (ev.type == 'EVENT_ALIAS_SELECTED') {
          self.onAliasSelected(ev.params);
        }
        // Clear event cookie
        $.cookie('event', '');    
      }  
    });                 
  },  
  onAddressSelected: function(params) {
    var eventView = null;
    if (params.stage == 'previous') {
      eventView = this.previousEventView;
    } else if (params.stage == 'current') {
      eventView = this.currentEventView;
    } else if (params.stage == 'next') {
      eventView = this.nextEventView;
    }
    if (eventView != null) {
      var id = eventView.appendAddressBook(params.address, params.lat, params.lng, true);
      eventView.selected = id;
      
      // If there is param for title, it means this address became to alias as well.
      // Add this item into alias list as well.
      if (params.title != null) {
        eventView.appendAlias(params.title, params.address, params.lat, params.lng);
      }
      eventView.render();
    }
  },
  onAliasSelected: function(params) {
    var eventView = null;
    if (params.stage == 'previous') {
      eventView = this.previousEventView;
    } else if (params.stage == 'current') {
      eventView = this.currentEventView;
    } else if (params.stage == 'next') {
      eventView = this.nextEventView;
    }
    if (eventView != null) {
      var id = eventView.appendAlias(params.title, params.address, params.lat, params.lng);
      eventView.selected = id;
      eventView.render();
    }
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
    } else if (response.rc == 410) {
      hideLoader();
      this.model = null;
    } else if (response.rc == 200) {
      hideLoader();
      var travelView = null;      
      if (this.travelType == 'previous') {
        travelView = this.previousTravelView;
      } else {
        travelView = this.nextTravelView;
      }      
      travelView.model = response.data;
      travelView.render();  
      this.renderButton();
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
  sanityCheck: function(from, to) {
    return (from.normalized == true && to.normalized == true);
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
    if (this.sanityCheck(from, to) != true) {      
      hideLoader();
      alert("The address in your events is not valid.\n\
Please use 'else where' button to choose proper location");
      return;
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
      error: function(response) { 
        hideLoader();
        if (response.rc == 401) {
          alert("You must authorize Timejust to access your calendar. Please go to " + App.config.web_url);
        } 
      }
    });
  },    
  renderButton: function() {
    if (this.previousTravelView.rendered == true) {
      $('#previous_travel_btn').html('RELOAD TRIP');  
    } else {
      $('#previous_travel_btn').html('PLAN TRIP');  
    }    
    if (this.nextTravelView.rendered == true) {
      $('#next_travel_btn').html('RELOAD TRIP');      
    } else {
      $('#next_travel_btn').html('PLAN TRIP');      
    }    
  },
  default_layout: _.template('\
    <div id="event_polling" style="display:none"></div>\
    <div class="transportations"></div>\
    <div id="previous_event"></div>\
    <div id="previous_travel"></div>\
    <a class="load_previous_travel" href="#">\
      <div class="green_btn">\
        <div id="previous_travel_btn" class="button_name"></div>\
      </div>\
    </a>\
    <div id="current_event"></div>\
    <div id="next_travel"></div>\
    <a class="load_next_travel" href="#">\
      <div class="green_btn">\
        <div id="next_travel_btn" class="button_name"></div>\
      </div>\
    </a>\
    <div id="next_event"></div>\
  '),  
  render: function() {
    var self = this;
    $(this.el).html(this.default_layout);
    this.previousEventView.el = $('#previous_event').get(0);
    this.previousEventView.summary = this.summaries[0];
    this.currentEventView.el = $('#current_event').get(0);
    this.currentEventView.summary = this.summaries[1];
    this.nextEventView.el = $('#next_event').get(0);
    this.nextEventView.summary = this.summaries[2];
    this.previousTravelView.el = $('#previous_travel').get(0);
    this.nextTravelView.el = $('#next_travel').get(0);
    
    this.renderButton();
    
    this.previousEventView.render();
    this.currentEventView.render();
    this.nextEventView.render();    
    
    $(this.el).html();    
    gadgets.window.adjustHeight();
    google.calendar.refreshEvents();
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
  toggleSteps: function(e) {
    e.preventDefault();    
    var container = $(e.currentTarget).parent('li').parent('ul').parent('div').find('.steps');
    $(e.currentTarget).toggleClass('on');
    $(e.currentTarget).toggleClass('off');
    container.toggle();
    gadgets.window.adjustHeight();
  },
  toggleEvent: function(e) {
    e.preventDefault();    
    var toggle = $(e.currentTarget).parent('ul').find('.toggle').find('.gray_toggle');
    var container = $(e.currentTarget).parent('ul').find('.aliases');
    $(toggle).toggleClass('on');
    $(toggle).toggleClass('off');
    var title = $(e.currentTarget).parent('ul').find('.title');
    var address = $(e.currentTarget).parent('ul').find('.address');    
    this.toggleText(title, 22);
    this.toggleHideText(address, 20);
    container.toggle();
    gadgets.window.adjustHeight();
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
    var container = $(e.currentTarget).parent('li').parent('ul').find('.aliases');
    $(e.currentTarget).toggleClass('on');
    $(e.currentTarget).toggleClass('off');    
    var title = $(e.currentTarget).parent('li').parent('ul').find('.title');
    var address = $(e.currentTarget).parent('li').parent('ul').find('.address');    
    this.toggleText(title, 22);
    this.toggleHideText(address, 20);
    container.toggle();
    gadgets.window.adjustHeight();
  },
  changeTitle: function(e) {
    e.preventDefault();    
    var el = $(e.currentTarget);
    var container = el.parent('li').parent('.aliases');
    var root = container.parent('ul').parent('div').parent('div');       
    var event = this.currentEvent(root);
    if (el.attr('selector') == 'true') {
      // Go to address selector page.
      this.showAddressSelector(event.summary, event.stage);
    } else {             
      event.selected = el.attr('id');
      event.render();
    }    
  },  
  // Show travel nodes selector view to confirm each travel nodes addresses
  // Also start polling from API to get travels proposals
  showAddressSelector: function(summary, stage) {
    // Set current address proposals and aliases to cookie
    // $.cookie('ab', summary.addressBook, { expires: 1 });
    var ab = JSON.stringify(summary.addressBook, this.replacer);
    var alias = JSON.stringify(summary.alias, this.replacer);
    $.cookie('ab', ab, { expires: 1 });    
    $.cookie('alias', alias, { expires: 1 });    
    $.cookie('original_address', summary.original_address, { expires: 1 });
    $.cookie('ip', this.ip, { expires: 1 });      
    $.cookie('stage', stage, { expires: 1 });
    gadgets.views.requestNavigateTo('canvas', { ip: this.ip });
    this.runEventPoller();    
  },
  replacer: function(key, value) {
    if (typeof value === 'number' && !isFinite(value)) {
        return String(value);
    }
    return value;
  },
  runEventPoller: function() {
    var e = $(this.el).find('#event_polling');
    e.trigger('poll');   
  },  
  clear: function() {
    this.previousEventView.clear();
    this.currentEventView.clear();
    this.nextEventView.clear();
    this.previousTravelView.clear();
    this.nextTravelView.clear();
    $(this.el).empty();
  }
});

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
    'click .travel_title'         : 'toggleSteps',
    'poll #event_polling'         : 'handleEvent',
    'click .plus_container'       : 'addToCalendar'
  },
  initialize: function(){
    showLoader();
    _.bindAll(this, 'waitForTravels');
    _.bindAll(this, 'waitForCalendars');
    _.bindAll(this, 'handleEvent'); 
    gadgets.window.adjustHeight();
    this.ip = this.options.ip;    
    this.eventView = this.options.eventView;
    this.summaries = new Array();    
    this.previousEventView = new App.Views.EventSummaryView({prefix: "from", stage: 'previous'});
    this.currentEventView = new App.Views.EventSummaryView({stage: 'current'});
    this.currentEventView.setCurrentEvent();
    this.nextEventView = new App.Views.EventSummaryView({prefix: "to", stage: 'next'});  
    this.previousTravelView = new App.Views.TravelView();
    this.nextTravelView = new App.Views.TravelView();
    this.travelType = 'previous';          
    this.pollerRunning = false;
  },
  appendEventSummary: function(i, summary) {
    this.summaries[i] = summary;
  },
  handleEvent: function(e) {
    var self = this;
    $.poll(200, function(retry) {
      var ev = $.cookie('event');    
      if (ev == null || ev == "") {
        retry();
      } else {  
        ev = eval('(' + ev + ')');      
        if (ev.type == 'EVENT_ADDRESS_SELECTED') {
          self.onAddressSelected(ev.params);
        } else if (ev.type == 'EVENT_ALIAS_SELECTED') {
          self.onAliasSelected(ev.params);
        } else if (ev.type == 'EVENT_ALIAS_ADDED') {
          self.onAliasAdded(ev.params);
        } else if (ev.type == 'EVENT_ALIAS_DELETED') {
          self.onAliasDeleted(ev.params);
        }
        // Clear event cookie
        timejust.setCookie('event', null);
        retry();
      }  
    });                 
  },  
  onAliasAdded: function(params) {
    this.previousEventView.appendAlias(params.title, params.address, params.lat, params.lng);
    this.currentEventView.appendAlias(params.title, params.address, params.lat, params.lng);
    this.nextEventView.appendAlias(params.title, params.address, params.lat, params.lng);
    this.previousEventView.render();
    this.currentEventView.render();
    this.nextEventView.render();    
  },
  onAliasDeleted: function(params) {
    this.previousEventView.deleteAlias(params.title);
    this.currentEventView.deleteAlias(params.title);
    this.nextEventView.deleteAlias(params.title);
    this.previousEventView.render();
    this.currentEventView.render();
    this.nextEventView.render();        
  },
  onAddressSelected: function(params) {
    var e = this.getEventWithStage(params.stage);    
    if (e != null) {
      var self = this;    
      var id = e.appendAddressBook(params.address, params.lat, params.lng, true);
      e.selected = id;      
      this.previousEventView.render();
      this.currentEventView.render();
      this.nextEventView.render();
      this.renderButton();
    }
  },
  onAliasSelected: function(params) {
    var e = this.getEventWithStage(params.stage);    
    if (e != null) {
      var self = this;  
      e.selectAliasItem(params.title);
      e.render();    
      this.renderButton();
    }
  },
  waitForTravels: function(response) {
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
  waitForCalendars: function() {    
    var self = this;    
    $.poll(function(retry){
      GoogleRequest.get({
        url: App.config.api_url + "/events/" + self.apiEventId + "/calendars?nocache=" + new Date().getTime(),
        // TODO spec
        success: function(response) {
          if (response.rc == 200) {
            google.calendar.refreshEvents();        
          } else {
            alert("It seems normal but not really...");
          }
        },
        // TODO spec
        error: function(response){
          if (response.rc == 404) {
            retry();
          } else {
            alert("Something's gone bad...");
          }
        }
      });
    });
  },
  // handle travel proposals response
  // if status is a 404, continue
  // if 410, stop, event was canceled
  // if 200, show travel proposals
  handleTravelResponse: function(response, retry) {
    if (response.rc == 404) {
      retry();
    } else if (response.rc == 410) {
      this.hideLoadingProgress();
      this.model = null;
    } else if (response.rc == 200) {
      this.hideLoadingProgress();
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
      this.waitForCalendars();      
    } else if (response.rc == 401) {
      alert("You must authorize Timejust to access your calendar. Please go to " + App.config.web_url);
    }
  },
  generatePreviousTravel: function(e) {
    var el = $(e.currentTarget).find(".button_name");      
    if (el.attr("planable") == "true") {
      this.travelType = 'previous';
      this.base = 'arrival';
      this.generateTrip(e);  
    } else {
      var stage = el.attr("stage");
      this.showAddressSelector(this.getEventWithStage(stage).summary, stage);
    }    
  },
  generateNextTravel: function(e) {
    var el = $(e.currentTarget).find(".button_name");   
    if (el.attr("planable") == "true") {
      this.travelType = 'next';
      this.base = 'departure';
      this.generateTrip(event);
    } else {
      var stage = el.attr("stage");
      this.showAddressSelector(this.getEventWithStage(stage).summary, stage);
    }
  },
  sanityCheck: function(from, to) {
    return (from.normalized == true && to.normalized == true);
  },
  duplicationCheck: function(from, to) {
    return (from.address == to.address);
  },
  // Launch request to API to create event in database
  // If it was created successfully, show travel nodes selector view
  generateTrip: function(event){
    event.preventDefault();
    gadgets.window.adjustHeight();        
    var from = null;
    var to = null;
    var self = this;
    if (this.travelType == 'previous') {
      from = this.previousEventView;
      to = this.currentEventView;
    } else {
      from = this.currentEventView;
      to = this.nextEventView;
    }    
    if (this.sanityCheck(from, to) != true) {      
      alert("The address in your events is not valid.\n\
Please use 'else where' button to choose proper location");
      return;
    }    
    if (this.duplicationCheck(from, to) == true) {
      alert("The departure address and arrival address are same");
      return;
    }    
    this.showLoadingProgress();
    
    // TODO : use Event model and bind callback on created event
    GoogleRequest.post({
      url: App.config.api_url + "/events",
      params: {
        event: JSON.stringify($.extend(
          this.selectedEvent,
          { before_start_time: 0, after_end_time: 0 }          
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
        self.hideLoadingProgress();
        if (response.rc == 401) {
          alert("You must authorize Timejust to access your calendar. Please go to " + App.config.web_url);
        } 
      }
    });
  },  
  showLoadingProgress: function() {
    var loading = null;
    var btn = null;
    if (this.travelType == 'previous') {
      loading = this.previousLoading;
      btn = $('#previous_travel_btn').parent('div').parent('a')[0];
    } else {
      loading = this.nextLoading;
      btn = $('#next_travel_btn').parent('div').parent('a')[0];
    }
    loading.style.display = "inline-block";        
    btn.style.display = "none";
  }, 
  hideLoadingProgress: function() {
    var loading = null;
    var btn = null;
    if (this.travelType == 'previous') {
      loading = this.previousLoading;
      btn = $('#previous_travel_btn').parent('div').parent('a')[0];
    } else {
      loading = this.nextLoading;
      btn = $('#next_travel_btn').parent('div').parent('a')[0];
    }
    loading.style.display = "none";
    btn.style.display = "inline"
  },
  setPlanableButton: function(btn) {
    btn.attr("style", "margin-top: 9px");
    btn.attr("planable", "true");
    btn.parent('div').find('.button_text').html("");
    btn.html('PLAN TRIP');
  },
  setUnplanableButton: function(view, btn) {
    if (view.summary.original_address) {
      // Set information text
      btn.html('PLEASE CLARIFY ');
      btn.attr("style", "margin-top: 1px");
      btn.parent('div').find('.button_text').html(
        view.summary.original_address);      
    } else {
      btn.attr("style", "margin-top: 1px");
      if (view.stage == "previous")
        btn.html("WHERE DO YOU WANT TO LEAVE FROM");     
      else 
        btn.html("WHERE DO YOU WANT TO GO TO");     
      btn.parent('div').find('.button_text').html("");
    }        
    // Set attribute leading to address selection page    
    btn.attr("stage", view.stage);
    btn.attr("planable", "false");    
  },  
  renderPlanableButton: function(view, btn) {
    if (view.normalized) {   
      this.setPlanableButton(btn);
    } else {
      this.setUnplanableButton(view, btn);      
    }
  },
  renderButton: function() {   
    var previous = $('#previous_travel_btn');
    var next = $('#next_travel_btn');
    // If current event has normalized address, buttons are rendered depend on 
    // previous and next events.
    if (this.currentEventView.normalized) {
      this.renderPlanableButton(this.previousEventView, previous);
      this.renderPlanableButton(this.nextEventView, next);
    } else {
      // If current event has non-normalized address, even if we have both 
      // previous and next events have normalized address, render with 
      this.setUnplanableButton(this.currentEventView, previous);      
      this.setUnplanableButton(this.currentEventView, next);      
    }    
  },
  default_layout: _.template('\
    <div id="event_polling" style="display:none"></div>\
    <div class="transportations"></div>\
    <div id="previous_event"></div>\
    <div id="previous_travel"></div>\
    <div id="previous_loading" class="loading" />\
    <a class="load_previous_travel" href="#">\
      <div class="green_btn">\
        <div id="previous_travel_btn" class="button_name"></div>\
        <div class="button_text"></div>\
      </div>\
    </a>\
    <div id="current_event"></div>\
    <div id="next_travel"></div>\
    <div id="next_loading" class="loading" />\
    <a class="load_next_travel" href="#">\
      <div class="green_btn">\
        <div id="next_travel_btn" class="button_name"></div>\
        <div class="button_text"></div>\
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
    this.previousLoading = $('#previous_loading').get(0);
    this.nextLoading = $('#next_loading').get(0);
        
    this.previousEventView.render();
    this.currentEventView.render();
    this.nextEventView.render();    
    this.renderButton();
    
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
  toggleText: function(el) {
    if (el.attr('shorten') == 'true') {
      el.attr('style', 'white-space: normal');
      el.attr('shorten', 'false');
    } else {
      el.attr('style', 'white-space: nowrap');
      el.attr('shorten', 'true');
    }
  },
  addToCalendar: function(e) {
    e.preventDefault();  
    var el = $(e.currentTarget);   
    if (el.attr('added') != "" && el.attr('added') != 'true') {
      showLoader();
      gadgets.window.adjustHeight();      
      el.toggleClass('on');        
      GoogleRequest.post({
        url: App.config.api_url + "/travels/" + el.attr('id') + "/save",
        params: {},
        success: function(response) {
          if (response.rc == 200) {
            el.attr('added', 'true');
            // Replace new tooltip with new text
            var tooltip = $("#tooltip_" + el[0].id);
            tooltip[0].textContent = "added to your calendar";                       
            // var primaryCalendarColor = response.data.primary_calendar_color;

            // Change item color to the color of primary calendar
            // var box = el.parent("ul").parent("div").parent("div");
            // box.attr('style', 'background-color:' + primaryCalendarColor + ';border-color: #DDDDDD;');            
          }
          hideLoader();
          google.calendar.refreshEvents();          
          gadgets.window.adjustHeight();
        },
        error: function(response) { 
          hideLoader();
          el.toggleClass('off');        
          if (response.rc == 401) {
            alert("You must authorize Timejust to access your calendar. Please go to " + App.config.web_url);
          } 
          gadgets.window.adjustHeight();
        }
      });      
    }     
  },  
  toggleSteps: function(e) {
    e.preventDefault();    
    var toggle = $(e.currentTarget).parent('li').parent('ul').find('.toggle').find('a');
    var container = $(e.currentTarget).parent('li').parent('ul').parent('div').find('.steps');
    $(toggle).toggleClass('on');
    $(toggle).toggleClass('off');    
    container.toggle();
    gadgets.window.adjustHeight();
  },
  toggleEvent: function(e) {
    e.preventDefault();    
    var toggle = $(e.currentTarget).parent('div').parent('ul').find('.toggle').find('.gray_toggle');
    var container = $(e.currentTarget).parent('div').parent('ul').find('.aliases');
    $(toggle).toggleClass('on');
    $(toggle).toggleClass('off');
    var title = $(e.currentTarget).parent('div').parent('ul').find('.title');
    var address = $(e.currentTarget).parent('div').parent('ul').find('.address');    
    this.toggleText(title);
    this.toggleText(address);
    container.toggle();
    gadgets.window.adjustHeight();
  },
  getEventWithStage: function(stage) {
    var e = null;
    if (stage == "previous") {
      e = this.previousEventView;
    } else if (stage == "current") {
      e = this.currentEventView;
    } else if (stage == "next") {
      e = this.nextEventView;
    }
    return e;
  },
  currentEvent: function(root) {
    var e = null;
    if (root[0].id == 'previous_event') {
      e = this.previousEventView;
    } else if (root[0].id == 'current_event') {
      e = this.currentEventView;
    } else if (root[0].id == 'next_event') {
      e = this.nextEventView;
    }
    return e;
  },
  grayToggleSteps: function(e) {
    e.preventDefault();    
    var container = $(e.currentTarget).parent('li').parent('div').parent('ul').find('.aliases');
    $(e.currentTarget).toggleClass('on');
    $(e.currentTarget).toggleClass('off');    
    var title = $(e.currentTarget).parent('li').parent('div').parent('ul').find('.title');
    var address = $(e.currentTarget).parent('li').parent('div').parent('ul').find('.address');    
    this.toggleText(title);
    this.toggleText(address);
    container.toggle();
    gadgets.window.adjustHeight();
  },
  changeTitle: function(e) {
    e.preventDefault();    
    var el = $(e.currentTarget);
    var container = el.parent('li').parent('div').parent('.aliases');
    var root = container.parent('ul').parent('div').parent('div');       
    var event = this.currentEvent(root);
    if (el.attr('selector') == 'true') {
      // Go to address selector page.
      this.showAddressSelector(event.summary, event.stage);
    } else {             
      /*
      if (el.attr('alias') == 'true' && event != this.currentEventView) {
        event.setAliasClassType();
      }
      */
      event.selected = el.attr('id');
      event.render();
      this.renderButton();
    }    
  },  
  // Show travel nodes selector view to confirm each travel nodes addresses
  // Also start polling from API to get travels proposals
  showAddressSelector: function(summary, stage) {
    // Set current address proposals and aliases to cookie
    // $.cookie('ab', summary.addressBook, { expires: 1 });
    var ab = JSON.stringify(summary.addressBook, this.replacer);
    var alias = JSON.stringify(summary.alias, this.replacer);

    timejust.setCookie('ab', ab);
    timejust.setCookie('alias', alias);
    timejust.setCookie('original_address', summary.original_address);
    timejust.setCookie('ip', this.ip);
    timejust.setCookie('stage', stage);
    this.runEventPoller();
    gadgets.views.requestNavigateTo('canvas', { ip: this.ip });
  },
  replacer: function(key, value) {
    if (typeof value === 'number' && !isFinite(value)) {
        return String(value);
    }
    return value;
  },
  runEventPoller: function() {
    if (this.pollerRunning != true) {
      var e = $(this.el).find('#event_polling');
      // Before starting event poller, clear event cookie
      timejust.setCookie('event', null);
      e.trigger('poll');         
      this.pollerRunning = true;
    }
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

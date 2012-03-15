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
    'click .plus_container'       : 'addToCalendar'
  },
  initialize: function(){
    showLoader();    
    _.bindAll(this, 'handleEvent'); 
    _.bindAll(this, 'handleTravel');
    gadgets.window.adjustHeight();
    this.ip = this.options.ip;    
    this.eventView = this.options.eventView;
    this.seed = this.eventView.seed;
    this.summaries = new Array();    
    this.previousEventView = new App.Views.EventSummaryView({prefix: "from", stage: 'previous'});
    this.currentEventView = new App.Views.EventSummaryView({stage: 'current'});
    this.currentEventView.setCurrentEvent();
    this.nextEventView = new App.Views.EventSummaryView({prefix: "to", stage: 'next'});  
    this.previousTravelView = new App.Views.TravelView();
    this.nextTravelView = new App.Views.TravelView();
    this.pollerRunning = false;
    this.travelQueue = new Array();   
    this.eventLoop = EventLoop.getInstance();
    this.eventLoop.callback = this.handleEvent;
  },
  appendEventSummary: function(i, summary) {
    this.summaries[i] = summary;
  },
  handleEvent: function(type, params) {
    var self = this;
    if (type == 'EVENT_ADDRESS_SELECTED') {
      self.onAddressSelected(params);
    } else if (type == 'EVENT_ALIAS_SELECTED') {
      self.onAliasSelected(params);
    } else if (type == 'EVENT_ALIAS_ADDED') {
      self.onAliasAdded(params);
    } else if (type == 'EVENT_ALIAS_DELETED') {
      self.onAliasDeleted(params);
    }
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
  generatePreviousTravel: function(e) {
    var el = $(e.currentTarget).find(".button_name");      
    if (el.attr("planable") == "true") {
      this.generateTrip(e, 'arrival', 'previous');  
    } else {
      var stage = el.attr("stage");
      var event = this.getEventWithStage(stage);
      this.showAddressSelector(event.summary, stage);
    }    
  },
  generateNextTravel: function(e) {
    var el = $(e.currentTarget).find(".button_name");   
    if (el.attr("planable") == "true") {
      this.generateTrip(e, 'departure', 'next');
    } else {
      var stage = el.attr("stage");
      var event = this.getEventWithStage(stage);
      this.showAddressSelector(event.summary, stage);
    }
  },
  sanityCheck: function(from, to) {
    return (from.normalized == true && to.normalized == true);
  },
  duplicationCheck: function(from, to) {
    return (from.address == to.address);
  },
  handleEventCreated: function() {
    google.calendar.refreshEvents();    
  },
  handleTravel: function(travel) {
    this.hideLoadingProgress(travel.type);
    if (travel != null) {
      // Render trave view
      var travelView = null;      
      if (travel.type == 'previous') {
        travelView = this.previousTravelView;
      } else {
        travelView = this.nextTravelView;
      }      
      travelView.model = travel.data;
      travelView.render();  
      this.renderButton();      
      gadgets.window.adjustHeight();  
      
      // Remove the first item from travel queue.
      this.travelQueue.splice(0, 1);      
      
      // We have to request another travel item from the queue until 
      // queue is empty.      
      if (this.travelQueue.length > 0) {
        App.Models.Travel.getTravel(this.travelQueue[0], 
          this.handleTravel);        
      }
      
      travel.handleEventCreated(this.handleEventCreated);
    } else {
      // Something has gone wrong.
    }
  },  
  // Launch request to API to create event in database
  // If it was created successfully, show travel nodes selector view
  generateTrip: function(event, base, type){
    event.preventDefault();
    var from = null;
    var to = null;
    if (type == 'previous') {
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

    // Soon as we push travel request, show loading progress bar.
    this.travelQueue.push({current: this.selectedEvent, 
      from: from, to: to, ip: this.ip, base: base, type: type});
    this.showLoadingProgress(type);          
    if (this.travelQueue.length == 1) {
      // We only do job when the queue has only one item
      App.Models.Travel.getTravel(this.travelQueue[0], 
        this.handleTravel);
    }     
  },  
  showLoadingProgress: function(type) {
    var loading = null;
    var btn = null;
    if (type == 'previous') {
      loading = this.previousLoading;
      btn = $('#previous_travel_btn').parent('div').parent('a')[0];
    } else {
      loading = this.nextLoading;
      btn = $('#next_travel_btn').parent('div').parent('a')[0];
    }
    loading.style.display = "inline-block";        
    btn.style.display = "none";
  }, 
  hideLoadingProgress: function(type) {
    var loading = null;
    var btn = null;
    if (type == 'previous') {
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
  setUnplanableButton: function(view, btn, btnStage) {
    if (view.summary.original_address) {
      // Set information text
      btn.html('PLEASE CLARIFY ');
      btn.attr("style", "margin-top: 1px");
      btn.parent('div').find('.button_text').html(
        view.summary.original_address);      
    } else {
      btn.attr("style", "margin-top: 1px");
      if (view.stage == "previous")
        btn.html("WHERE ARE YOU LEAVING FROM?");     
      else if (view.stage == "next")
        btn.html("WHERE ARE YOU GOING TO?");     
      else {
        if (btnStage == "previous")
          btn.html("WHERE ARE YOU GOING TO?");     
        else 
          btn.html("WHERE ARE YOU LEAVING FROM?");     
      }
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
      this.setUnplanableButton(view, btn, view.stage);      
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
      this.setUnplanableButton(this.currentEventView, previous, "previous");      
      this.setUnplanableButton(this.currentEventView, next, "next");      
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
    this.eventLoop.el = $('#event_polling');
        
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
    var ab = JSON.stringify(summary.addressBook, this.replacer);
    var alias = JSON.stringify(summary.alias, this.replacer);
    timejust.setCookie(this.seed + '_ab', ab);
    timejust.setCookie(this.seed + '_alias', alias);
    this.eventLoop.run();
    gadgets.views.requestNavigateTo('canvas', { 
      ip: this.ip, stage: stage, eventKey: this.eventLoop.eventKey,
      original_address: summary.original_address, seed: this.seed });
  },
  replacer: function(key, value) {
    if (typeof value === 'number' && !isFinite(value)) {
        return String(value);
    }
    return value;
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

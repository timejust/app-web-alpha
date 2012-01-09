// Show travels and refresh calendar
App.Views.TravelsView = Backbone.View.extend({
  className: 'travels',
  events: {
    'click .travel_node_toggle':  'toggleTravelNode',
    'click .white_toggle'      :  'whiteToggleSteps',
    // 'click .blue_toggle'       :  'blueToggleSteps',
    'click .gray_toggle'       :  'grayToggleSteps',
    'click .show_travel_node'  :  'generateTrip',
    'click .value':               'changeTitle'
  },
  initialize: function(){
    showLoader();
    _.bindAll(this, 'generateTripCallback');
    gadgets.window.adjustHeight();
    // this.apiEventId = this.options.apiEventId;
    // this.selectedEvent = this.options.selectedEvent;
    this.ip = this.options.ip;
    this.base = this.options.base;
    this.eventView = this.options.eventView;
    this.summaries = new Array();    
    this.previousTravel = new App.Views.TravelSummaryView({prefix: "from"});
    this.currentTravel = new App.Views.TravelSummaryView();
    this.nextTravel = new App.Views.TravelSummaryView({prefix: "to"});                                      
    // this.waitForTravels();
  },
  appendTravelSummary: function(i, summary) {
    this.summaries[i] = summary;
  },
  waitForTravels: function(){
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
      this.model = new App.Models.Event(response.data);
      // this.eventView.showButton = false;
      this.eventView.render();
      this.render();
    }
  },
  // Template to show confirmed travel node results
  travel_results_template: _.template('\
    <div class="travel_results">\
      <%= current_travel%>\
      <%= event_travel%>\
    </div>\
  '),
  // Template to show single travel node
  travel_node_template: _.template('\
    <div class="travel_node">\
      <%= head%>\
      <%= trips%>\
    </div>\
  '),
  // Launch request to API to create event in database
  // If it was created successfully, show travel nodes selector view
  generateTrip: function(event){
    event.preventDefault();
    this.clear();    
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
    gadgets.views.requestNavigateTo('canvas', { apiEventId: this.model.get('_id') });
    this.apiEventId = this.model.get('_id');
    this.waitForTravels();
  },
  // Template to show head box with alias information
  travel_head_with_alias: _.template('\
    <div class="gray">\
      <ul>\
        <li><a class="white_toggle off" href="#"></a></li>\
        <li class="event_title"><%= prefix%> <%= alias%></li>\
        <li><a class="reload" href="#"></a></li>\
      </ul>\
      <ul>\
        <li class="address"><a href="#" class="show_travel_node"><%= address%></a></li>\
        <li><a class="place" href="#"></a></li>\
      </ul>\
    </div>\
  '),
  // Template to show head box with schedule information
  travel_head_with_schedule: _.template('\
    <div class="blue">\
      <ul>\
        <li><a class="blue_toggle off" href="#"></a></li>\
        <li class="event_title"><%= title%></li>\
        <li><a class="reload" href="#"></a></li>\
      </ul>\
      <ul>\
        <li class="address"><a href="#" class="show_travel_node"><%= address%></a></li>\
        <li><a class="place" href="#"></a></li>\
      </ul>\
    </div>\
  '),
  // Template to show head box with schedule information
  travel_green: _.template('\
    <div class="green">\
      <ul>\
        <li><a class="green_toggle off" href="#"></a></li>\
        <li class="event_title">test</li>\
      </ul>\
      <ul>\
        <li class="address">test</li>\
      </ul>\
    </div>\
  '),
  // Template to show confirmed travel nodes
  travel_nodes_template: _.template('\
    <div class="gray">\
      <ul>\
        <li><img src="http://staging.timejust.com:50001/icons/white-arrow-down.png"></img></li>\
        <li class="alias">from</li>\
        <li class="accessory"><img src="http://staging.timejust.com:50001/icons/refresh-white.png"></img></li>\
      </ul>\
      <ul>\
        <li class="address"><%= previous_travel_node["address"] %></img></li>\
        <li><div class="accessory"><img src="http://staging.timejust.com:50001/icons/place-white.png"></img></li>\
      </ul>\
    </div>\
    <div class="green">\
      <ul>\
        <li><img src="http://staging.timejust.com:50001/icons/white-arrow-down.png"></img></li>\
        <li class="alias">from</li>\
        <li class="accessory"><img src="http://staging.timejust.com:50001/icons/refresh-white.png"></img></li>\
      </ul>\
      <ul>\
        <li class="address"><%= previous_travel_node["address"] %></img></li>\
        <li><div class="accessory"><img src="http://staging.timejust.com:50001/icons/place-white.png"></img></li>\
      </ul>\
    </div>\
    <div class="pink">\
      <ul>\
        <li><img src="http://staging.timejust.com:50001/icons/white-arrow-down.png"></img></li>\
        <li class="alias">from</li>\
        <li class="accessory"><img src="http://staging.timejust.com:50001/icons/refresh-white.png"></img></li>\
      </ul>\
      <ul>\
        <li class="address"><%= previous_travel_node["address"] %></img></li>\
        <li><div class="accessory"><img src="http://staging.timejust.com:50001/icons/place-white.png"></img></li>\
      </ul>\
    </div>\
    <div class="yellow">\
      <ul>\
        <li><img src="http://staging.timejust.com:50001/icons/white-arrow-down.png"></img></li>\
        <li class="alias">from</li>\
        <li class="accessory"><img src="http://staging.timejust.com:50001/icons/refresh-white.png"></img></li>\
      </ul>\
      <ul>\
        <li class="address"><%= previous_travel_node["address"] %></img></li>\
        <li><div class="accessory"><img src="http://staging.timejust.com:50001/icons/place-white.png"></img></li>\
      </ul>\
    </div>\
    <div class="blue">\
      <ul>\
        <li><img src="http://staging.timejust.com:50001/icons/white-arrow-down.png"></img></li>\
        <li class="alias">from</li>\
        <li class="accessory"><img src="http://staging.timejust.com:50001/icons/refresh-white.png"></img></li>\
      </ul>\
      <ul>\
        <li class="address"><%= previous_travel_node["address"] %></img></li>\
        <li><div class="accessory"><img src="http://staging.timejust.com:50001/icons/place-white.png"></img></li>\
      </ul>\
    </div>\
    <ul>\
      <li class="previous_travel_node title">\
        <a class="travel_node_toggle off" href="#"></a><span>From</span>\
        <ul class="travel_node_expand">\
          <li class="address"><%= previous_travel_node["address"] %></li>\
          <% if (previous_travel_node["event_google_id"] != ""){ %>\
            <li><%= previous_travel_node["event_title"] %></li>\
            <li><%= $.format.date(previous_travel_node["event_start_time"], App.config.time) %> - <%= $.format.date(previous_travel_node["event_end_time"], App.config.time) %></li>\
          <% } %>\
        </ul>\
      </li>\
      <li class="current_travel_node title">\
        <a class="travel_node_toggle off" href="#"></a><span>To</span>\
        <ul class="travel_node_expand">\
          <li class="address"><%= current_travel_node["address"] %></li>\
          <% if (current_travel_node["event_google_id"] != ""){ %>\
            <li><%= current_travel_node["event_title"] %></li>\
            <li><%= $.format.date(current_travel_node["event_start_time"], App.config.time) %> - <%= $.format.date(current_travel_node["event_end_time"], App.config.time) %></li>\
          <% } %>\
        </ul>\
      </li>\
      <li class="next_travel_node title">\
        <a class="travel_node_toggle off" href="#"></a><span>Then</span>\
        <ul class="travel_node_expand">\
          <li class="address"><%= next_travel_node["address"] %></li>\
          <% if (next_travel_node["event_google_id"] != ""){ %>\
            <li><%= next_travel_node["event_title"] %></li>\
            <li><%= $.format.date(next_travel_node["event_start_time"], App.config.time) %> - <%= $.format.date(next_travel_node["event_end_time"], App.config.time) %></li>\
          <% } %>\
        </ul>\
      </li>\
    </ul>\
  '),
  render: function() {
    var self = this;
    $(this.el).html("\
    <div class='transportations'></div>\
    <div id='previous_event'></div>\
    <a class='load_previous_travel' href='#'><div class='green_btn'><div class='button_name'>PLAN THIS TRIP</div></div></a>\
    <div id='current_event'></div>\
    <a class='load_next_travel' href='#'><div class='green_btn'><div class='button_name'>PLAN THIS TRIP</div></div></a>\
    <div id='next_event'></div>\
    ");
    this.previousTravel.el = $('#previous_event').get(0);
    this.previousTravel.summary = this.summaries[0];
    this.currentTravel.el = $('#current_event').get(0);
    this.currentTravel.summary = this.summaries[1];
    this.nextTravel.el = $('#next_event').get(0);
    this.nextTravel.summary = this.summaries[2];
    
    this.previousTravel.render();
    this.currentTravel.render();
    this.nextTravel.render();    
    
    $(this.el).html();
    
    /*
    $(this.el).html();
    var travels = "";
    if (this.model.get('travels').length == 0){
      $(this.el).append("No travel proposals found");
    }
    else{
      $.each(this.model.get('travels'), function(i, travel){
        var view = new App.Views.TravelView({ model: new App.Models.Travel(travel) });
        // TODO spec
        $(self.el).append(view.render().el);
      });
    }
    */
    gadgets.window.adjustHeight();
    // google.calendar.refreshEvents();
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
      event = this.previousTravel;
    } else if (root[0].id == 'current_event') {
      event = this.currentTravel;
    } else if (root[0].id == 'next_event') {
      event = this.nextTravel;
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
    } else {
      var root = container.parent('ul').parent('div').parent('div');    
      var event = this.currentEvent(root);
      event.selected = el.attr('id');
      event.render();
    }    
  },  
  clear: function(){
    $(this.el).empty();
  }
});

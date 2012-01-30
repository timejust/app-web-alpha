/*
<p class="gt_button"><a href="#" class="get_there">GET THERE !</a></p>\
<p class="gt_button"><a href="#" class="leave_from">LEAVE FROM !</a></p>\
*/
App.Views.EventView = Backbone.View.extend({
  initialize: function(){
    _.bindAll(this, 'calendarEventOccured');
    _.bindAll(this, 'error');
    _.bindAll(this, 'onEventCallback');
    _.bindAll(this, 'onNormalizedAddress');
    _.bindAll(this, 'onAlias');
    this.ip = this.options.ip
    this.user = this.options.user      
    // Bind event on calendar event click
    google.calendar.read.subscribeToEvents(this.calendarEventOccured);
    timejust.setCookie('email', this.user.email);
    this.getAlias(this.user.email, this.onAlias);    
    this.previousEvent = null;
    this.nextEvent = null;
    this.alias = null;
    this.selectedEvent = null;
    this.nextEventRequest = false;
    this.normalizedReq = new Array();
    this.isInitialized = false;
    // List of google events
    this.events = new Array();
  },
  template: _.template('\
    <p class="title"><%= title %></p>\
    <p class="location"><%= location %></p>\
    <ul class="schedule">\
      <li class="event_date"></li>\
      <li><%= $.format.date(google.calendar.utils.toDate(startTime), App.config.dateOnly) %></li>\
      <li class="event_time"></li>\
      <li><%if(startTime.hour < 10){%>0<%}%><%=startTime.hour%>:<%if(startTime.minute < 10){%>0<%}%><%= startTime.minute %></li>\
    </ul>\
  '),
  // Calendar event was clicked, store and display it
  calendarEventOccured: function(calendarEvent){
    if (this.isInitialized != true) {
      return;
    }    
    if (calendarEvent && calendarEvent['id']) {
      if (this.selectedEvent != null) {
        this.clear();
      }
      // don't use event from proposals calendars
      if (!App.config.calendar_names || 
        $.inArray(calendarEvent['calendar']['name'], 
                  App.config.calendar_names) == -1) {
        this.selectedEvent = calendarEvent;
        // this.showButton = true;
        if (this.travels_view) {
          this.travels_view.clear();
          this.travels_view.ip = this.ip;
          this.travels_view.eventView = this;          
        } else {
          this.travels_view = new App.Views.TravelsView({ 
            el: $('#travels').get(0),               
            ip: this.ip, 
            eventView: this });
        }        
        // Load previous and next events within 1 day from google calendar
        this.getCalendarEvent(this.user.email, calendarEvent.startTime, -1, false, this.onEventCallback);        
      }
    }
    this.render();
  },
  getTimeWithDiff: function(time, diff) {
    var date = new Date();
    date.setFullYear(time.year, time.month-1, time.date);
    date.setHours(time.hour, time.minute, time.second, 0);
    var unixtime = parseInt(date / 1000);
    unixtime += diff;
    date = new Date(unixtime * 1000);
    return {year: date.getFullYear(), month: date.getMonth() + 1, date: date.getDate(), 
        hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds()};
  },
  // Recalculate date object with the given date difference
  getTimeWithDayDiff: function(time, diff) {
    return this.getTimeWithDiff(time, (diff * 60 * 60 * 24));
  },
  // Recalculate date object with the given date difference
  getTimeWithMinuteDiff: function(time, diff) {
    return this.getTimeWithDiff(time, (diff * 60));
  },
  getCalendarEvent: function(email, currentTime, dayDiff, next, callback) {
    var startDate = "";
    var endDate = "";
    if (dayDiff > 0) {
      startDate = this.getTimeWithMinuteDiff(currentTime, 1);
      endDate = this.getTimeWithDayDiff(currentTime, dayDiff);
    } else {
      startDate = this.getTimeWithDayDiff(currentTime, dayDiff);
      endDate = this.getTimeWithMinuteDiff(currentTime, -1);
    }
    this.nextEventRequest = next;
    if (next == true) {
      this.nextEvent = null;
    } else {
      this.previousEvent = null;
    }
    google.calendar.read.getEvents(callback, [email], startDate, endDate);
  },
  onEventCallback: function(response) {
    var res = response[0];
    if ('error' in res) {
      alert('Something went wrong');
      return;
    }    
    var events = res['events'];    
    if (this.nextEventRequest == false) {
      if (events.length > 0) {
        // Get latest event from the list    
        var e = events[events.length-1];
        this.previousEvent = e;         
      }      
      this.getCalendarEvent(this.user.email, this.selectedEvent.endTime, 1, true, this.onEventCallback);  
    } else {
      if (events.length > 0) {
        var e = events[0];
        this.nextEvent = e;            
      }
      // Even if we don't retrieve any of events, we need to call
      // normalizeAddress function to process further events.
      this.normalizeAddress();  
    }    
  },
  toRecognizer: function(event, id, ip) {
    return {"geo":encodeURIComponent(event.location), "id":id, "src":ip}
  },
  normalizeAddress: function() {
    var body = new Array();
    var id = 0;
    this.events[0] = this.previousEvent;
    this.events[1] = this.selectedEvent;
    this.events[2] = this.nextEvent;    
    for (var i = 0; i < this.events.length; ++i) {
      if (this.events[i] != undefined && this.events[i].location != "") {
        var loc = this.events[i].location;
        var isAlias = false;
        // If location is started with '@', we assume the location is
        // alias first. Let's try to find the keyword from the alias list.
        // If exists, do not normalize it. If not, we need to normalize it.
        if (loc.length > 0 && loc[0] == '@') {
          $.each(this.alias, function(i, a) {
            if (a.title == loc) {
              // Found it. Do not normalize this
              isAlias = true;
              return;
            }
          });          
        }         
        if (isAlias == false) {
          body.push(this.toRecognizer(this.events[i], id.toString(), this.ip))  
          this.normalizedReq[id] = i;
          id += 1;  
          this.events[i].alias = false;
        } else {
          this.events[i].alias = true;
        }
      }
    }   
    if (body.length == 0) {
      // We don't have to go through normalized address process because, all the events
      // don't have proper addresses which have to be normalized.
      this.renderTravelView();
      return;
    }
    GoogleRequest.postWithoutEncoding({
      url: App.config.service_url + "/service-geo/v1/geo/recognition",
      params: JSON.stringify(body),
      success: this.onNormalizedAddress,
      error: function() {        
      }
    }); 
  },
  onNormalizedAddress: function(response) {    
    if (response.data.status == 'ok') {
      var res = response.data.results;      
      for (var i = 0; i < res.length; i++) {
        var t = res[i][i];
        if (t.status == 'ok') {
          var id = this.normalizedReq[i];
          this.events[id].addresses = new Array();
          for (var k = 0; k < t.results.length; ++k) {
            this.events[id].addresses[k] = t.results[k];
          }
        }                 
      }      
    }
    this.renderTravelView();
  },
  renderTravelView: function() {    
    var self = this;
    $.each(this.events, function(i, ev) {
      var title = (ev == null ? null : ev.title)
      var summary = new App.Models.EventSummary({alias: self.alias, title: title});
      if (ev != null) {
        summary.color = ev.color;
        // Append all addresses either from normalization process or google calendar.
        if (ev.addresses == undefined) {
          if (ev.location != "") {
            if (ev.alias == false) {
              summary.appendAddressBook(ev.location, 0.0, 0.0, false);
            } else {
              summary.setAliasSelect(ev.location);
            }
          }            
        } else {
          $.each(ev.addresses, function(k, address) {
            summary.appendAddressBook(address.address, 
                address.location.lat, address.location.lng, true);
          });             
        }  
        summary.googleEventId = ev.id;
        summary.original_address = ev.location;
      } else {
        summary.original_address = "";
      }
      // summary.dump();
      self.travels_view.selectedEvent = self.selectedEvent;
      // Append summaries for previous, current, and next travel
      // to travel views and render them in the view.      
      self.travels_view.appendEventSummary(i, summary);
    });       
    hideLoader();  
    this.travels_view.render();
  },
  getAlias: function(email, callback) {
    GoogleRequest.get({
      url: App.config.api_url + "/users/alias?email=" + email + "&nocache=" + new Date().getTime(),
      success: callback, 
      error: callback
    });
  },
  onAlias: function(response) {
    this.alias = response.data;
    this.render();
    this.isInitialized = true;
  },
  // Render the selected Event in gadget sidebar
  render: function(){
    if (this.selectedEvent){
      $(this.el).html(this.template(this.selectedEvent));
    } else{
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
  clear: function(){
    showLoader();
    var self = this;
    app.user.purgeTravels({
      success: function(){
        google.calendar.refreshEvents();
        self.selectedEvent = null;
        // self.render();
        // if (self.travels_view) {
        //  self.travels_view.clear();
        // }
        // gadgets.window.adjustHeight();
        hideLoader();
      },
      error: function(){
        hideLoader();
      }
    });
  }
});

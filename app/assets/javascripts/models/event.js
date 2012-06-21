App.Models.Event = Backbone.Model.extend({
  initialize: function(options) {
    this.base = App.config.service_url + '/v1/calendar/';
    this.email = options.calendarId
    this.eId = options.eId
  },
  url: function() {
    var base = this.base + this.email + '/events/'    
    return this._id != null ? base + this._id : base
  },
  urlWithEid: function() {
    var base = this.base + this.email + '/events/eid/'    
    return this.eId != null ? base + this.eId : base
  },
  fetch: function() {    
  },
  fetchWithEid: function(callback) {
    var self = this;
    // alert(this.urlWithEid() + "?nocache=" + new Date().getTime())
    GoogleRequest.get({
      url: this.urlWithEid() + "?nocache=" + new Date().getTime(),
      error: function() {          
        callback(null);
      },
      success: function(resp) {
        // alert(resp.rc + ", " + resp.data.status)
        if (resp.rc == 200 && resp.data.status == 'ok') {
          var e = resp.data.event;
          self.set({_id: e.id, 
                    calendarId: e.calendarId, 
                    start: e.start, 
                    end: e.end, 
                    lat: e.position.lat, 
                    lng: e.position.lng,
                    location: e.location,
                    summary: e.summary,
                    description: e.description,
                    eventType: e.eventType,
                    eId: e.eid,
                    nextTravel: e.nextTravel,
                    previousTravel: e.previousTravel,
                    created: e.created,
                    updated: e.updated});  
          if (callback != null) {
            callback(self);
          }             
        } else {
          callback(null);
        }          
      }          
    });
  }
});

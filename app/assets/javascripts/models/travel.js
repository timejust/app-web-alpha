App.Models.Travel = Backbone.Model.extend({
  initialize: function() {
    _.bindAll(this, 'handleTravelCreated');    
    this.callback = null;
    this.apiEventId = null;
    this.data = null;
    this.type == 'previous';
  },
  url: function() {
    var base = App.config.api_url + '/travels';
    if (this.isNew()) return base;
    return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
  },
  confirm: function(options) {
    GoogleRequest.put({
      url: this.url() + '/confirm',
      success: function(){
        if (options.success) {options.success();}
      },
      error: function(){
        if (options.error) {options.error();}
      }
    });
  },
  bookmark: function(options) {
    GoogleRequest.put({
      url: this.url() + '/bookmark',
      success: function(){
        if (options.success) {options.success();}
      },
      error: function(){
        if (options.error) {options.error();}
      }
    });
  },
  locomotion: function(){
    if (this.get('provider') == 'ratp'){
      return 'public transportation';
    }
    else if (this.get('provider') == 'google-directions'){
      return 'car travel';
    }
  },
  handleEventCreated: function(callback) {    
    var self = this;    
    $.poll(function(retry){
      GoogleRequest.get({
        url: App.config.api_url + "/events/" + self.apiEventId + "/calendars?nocache=" + new Date().getTime(),
        success: function(response) {
          if (response.rc == 200) {
            callback();
          }
        },
        error: function(response){
          if (response.rc == 404) {
            retry();
          }
        }
      });
    });
  },  
  handleTravelCreated: function(response) {    
    this.apiEventId = response.data._id;
    var self = this;        
    
    // Start polling for Travel proposals
    $.poll(function(retry){
      GoogleRequest.get({
        url: App.config.api_url + "/events/" + self.apiEventId + "/travels?nocache=" + new Date().getTime(),
        success: function(response) {
          self.data = response.data;
          if (self.callback != null) {
            self.callback(self);
          }
        },
        error: function(response) {
          if (response.rc == 404) {
            retry();
          } else {
            if (self.callback != null) {
              self.callback(null);
            }            
          }
        }
      });
    });
  },  
});

App.Models.Travel.getTravel = function(params, callback) {
  var travel = new App.Models.Travel();    
  var from = params.from;
  var to = params.to;
  travel.callback = callback;
  travel.type = params.type;
  
  GoogleRequest.post({
    url: App.config.api_url + "/events",
    params: {
      event: JSON.stringify($.extend(
        params.current,
        { before_start_time: 0, after_end_time: 0 }          
      )),
      current_ip: params.ip,        
      base: params.base,
      'previous_travel_node[address]': from.address,
      'previous_travel_node[title]': from.title,
      'previous_travel_node[event_google_id]': params.from.summary.googleEventId,
      'previous_travel_node[lat]' : from.lat,
      'previous_travel_node[lng]' : from.lng,
      'current_travel_node[address]': to.address,
      'current_travel_node[title]': to.title,
      'current_travel_node[event_google_id]': params.to.summary.googleEventId,
      'current_travel_node[lat]' : to.lat,
      'current_travel_node[lng]' : to.lng
    },
    success: travel.handleTravelCreated,
    error: function(response) { 
      callback(null);
    }
  });    
}

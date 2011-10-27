var User = Backbone.Model.extend({

  initialize: function(){
    _.bindAll(this, 'preferencesCallback', 'setStatus', 'loadPendingEvents');
    this.preferences = undefined;
    this.email = undefined;
    this.state = 'waiting';
    this.pendingEvent = undefined;
    this.bind('preferences:loaded', this.loadPendingEvents);
    this.loadPreferences();
  },

  // Ask user email & preferences from Google API
  loadPreferences: function(){
    google.calendar.getPreferences(this.preferencesCallback);
  },

  // Store user preferences, and call API to get user state
  preferencesCallback: function(prefs){
    this.preferences = prefs;
    this.email = prefs.viewer;
    this.trigger('preferences:loaded');
  },

  // Call Api to know :
  // * if he is registered
  // * he has pending event to show
  loadPendingEvents: function(){
    GoogleRequest.get({
      url: App.config.api_url + "/users/status?email=" + this.email + "&nocache=" + new Date().getTime(),
      success: this.setStatus
    });
  },

  // Set attributes from API response
  setStatus: function(response){
    if (response.rc == 404) {
      this.state = 'not_registered';
    }
    else if (response.rc == 401) {
      this.state = 'unauthorized';
    }
    else{
      this.state = 'registered';
      if (response.rc == 200){
        this.pendingEvent = response.data;
      }
    }
    this.trigger('status:loaded');
  },

  // Purge waiting travels
  purgeTravels: function(options) {
    GoogleRequest.put({
      url: App.config.api_url + '/users/purge_travels',
      success: function(response){
        if (options.success) {options.success();}
      },
      error: function(response){
        if (options.error) {options.error();}
      }
    });
  }
});

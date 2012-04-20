// FIXME : better mock :/
window.google = {
  calendar: {
    read: {
      subscribeToEvents: function(callback) {},
      getEvents: function(a, b, c, d, e) {}
    },
    utils: {
      toDate: function(date) {return date;}
    },
    subscribeToDataChange: function(callback) {},
    getPreferences: function(callback) {},
    refreshEvents: function(callback) {},
  },
  maps: {
    places: {
      Autocomplete: function(a) {
        return {
          setTypes: function(b) {}
        }
      }
    },
    event: {
      addListener: function(a, b, c) {}
    },
    LatLng: function(a, b) {},
    Map: function(a, b) {},
    MapTypeId: {
      ROADMAP: "roadmap",
    }    
  }
}
window.gadgets = {
  window: {
    adjustHeight: function(){}
  },
  io: {
    encodeValues: function(params) { params; },
    RequestParameters: {
      METHOD: "method",
      CONTENT_TYPE: "content_type",
      POST_DATA: "post_data",
      HEADERS: "headers"
    },
    MethodType: {
      POST: 'post',
      GET: 'get'
    },
    ContentType: {
      JSON: 'json'
    },
    makeRequest: function(){}
  },
  views: {
    getParams: function(){}
  }
}

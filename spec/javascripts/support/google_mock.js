// FIXME : better mock :/
window.google = {
  calendar: {
    read: {
      subscribeToEvents: function(callback){}
    },
    utils: {
      toDate: function(date) {return date;}
    },
    getPreferences: function(callback){},
    refreshEvents: function(callback){}
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

var App = {
  Models: {},
  Views: {},
  Controllers: {},
  config: {
    time: "hh:mm a",
    time24: "hh:mm",
    date: "ddd dd MMM yyyy hh:mm",
    dateOnly: "dd MMM yyyy"
  }
};

// Use _id as attribute for model id
Backbone.Model.prototype.idAttribute = "_id";

// Override Backbone.sync to use google makeRequest
Backbone.sync = function(method, model, options){
  options.url = model.url();
  switch(method) {
    case 'read':
      GoogleRequest.get(options);
      break;
    case 'create':
      GoogleRequest.post(options);
      break;
    case 'update':
      GoogleRequest.put(options);
      break;
    case 'delete':
      GoogleRequest.destroy(options);
      break;
  }
};

// Move in App ?
function showLoader() {
  $('.loader').show();
}

function hideLoader() {
  $('.loader').hide();
}

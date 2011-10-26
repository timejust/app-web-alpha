// Show travels and refresh calendar
App.Views.TravelsView = Backbone.View.extend({
  className: 'travels',
  events: {
    'click .travel_node_toggle':  'toggleTravelNode'
  },
  initialize: function(){
    showLoader();
    gadgets.window.adjustHeight();
    this.apiEventId = this.options.apiEventId;
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
      this.render();
    }
  },
  // Template to show confirmed travel nodes
  travel_nodes_template: _.template('\
    <ul>\
      <li class="previous_travel_node title">\
        <a class="travel_node_toggle off" href="#"></a>From\
        <ul class="travel_node_expand">\
          <li class="address"><%= previous_travel_node["address"] %></li>\
          <% if (previous_travel_node["event_google_id"] != ""){ %>\
            <li><%= previous_travel_node["event_title"] %></li>\
            <li><%= $.format.date(previous_travel_node["event_start_time"], App.config.time) %> - <%= $.format.date(previous_travel_node["event_end_time"], App.config.time) %></li>\
          <% } %>\
        </ul>\
      </li>\
      <li class="next_travel_node title">\
        <a class="travel_node_toggle off" href="#"></a>Then\
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
  render: function(){
    var self = this;
    $(this.el).html(this.travel_nodes_template(this.model.toJSON()));
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
    gadgets.window.adjustHeight();
    google.calendar.refreshEvents();
  },
  // TODO spec
  toggleTravelNode: function(e){
    e.preventDefault();
    $(e.currentTarget).toggleClass('on');
    $(e.currentTarget).toggleClass('off');
    $(e.currentTarget).siblings('.travel_node_expand').toggle();
    gadgets.window.adjustHeight();
  }
});

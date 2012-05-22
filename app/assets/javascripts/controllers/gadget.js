App.Controllers.GadgetController = Backbone.Router.extend({
  // Gadget home view
  sidebar: function() {
    this.user = new User();
    _.bindAll(this, 'initSidebarViews');
    this.user.bind('status:loaded', this.initSidebarViews);
  },
  getip: function(json) {
    this.ip = json.ip;
  },
  // Initialize Views from user status and pending events
  initSidebarViews: function() {
    if (this.user.state == "not_registered") {
      $('#notifications').html("<p>You must register on <a href='" + App.config.web_url + "' target='blank'>Timejust website</a></p>");
      gadgets.window.adjustHeight();
    }
    if (this.user.state == "unauthorized") {
      $('#notifications').html("<p>You must authorize Timejust to access your calendar by clicking : <a href='" + App.config.web_url + "/oauth2/authorize?return_to=http://google.com/calendar' target='blank'>here</a></p>");
      gadgets.window.adjustHeight();
    } else {
      /* We don't purge travels now.      
      this.user.purgeTravels({
        success: function() {
          google.calendar.refreshEvents();
        }
      });
      */
      new App.Views.EventView({ el: $('#selectedEvent').get(0), ip: this.ip, user: this.user });
    }
  },
  // Gadget travel node selector view (canvas)
  travel_node_selector: function() {
    new App.Views.TravelNodesSelectorView({
      el: $('#travelNodesSelector').get(0),
      ip: gadgets.views.getParams()['ip'],
      eventKey: gadgets.views.getParams()['eventKey'],
      seed: gadgets.views.getParams()['seed'],
      stage: gadgets.views.getParams()['stage'],
      original_address: gadgets.views.getParams()['original_address']
    });
  }
});

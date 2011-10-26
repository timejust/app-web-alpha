App.Views.TravelStepView = Backbone.View.extend({
  className: 'travel_step',
  events: {
    'click .confirm':       'confirm',
    'click .destroy':       'destroy',
    'click .bookmark':      'bookmark',
    'click .steps_toggle':  'toggleSteps'
  },
  initialize: function(){
    this.loader = $('.loader').first().clone().css('display', 'inline');
    _.bindAll(this,
      'errorOnConfirm', 'errorOnDestroy',
      'errorOnBookmark', 'successOnConfirm',
      'successOnDestroy', 'successOnBookmark');
  },
  travel_step: _.template('\
    <ul class="google_directions">\
      <li class="title">\
        <a class="steps_toggle off" href="#"></a>\
        <span class="steps_summary">\
          <% if (typeof(summary) != "undefined" && summary != null){ %>\
            <span class="<%= calendar %>"><%= summary.join("-") %></span>\
          <% } %>\
        </span>\
        <span class="departure_time"><%= $.format.date(departure_time, App.config.time) %></span>\
         -> \
        <span class="arrival_time"><%= $.format.date(arrival_time, App.config.time) %></span>\
        - <span class="estimated_time"><%= estimated_time %> min</span>\
        <% if (typeof(steps_count) != "undefined" && steps_count != null){ %>\
          - <span class="steps_count"><%= steps_count %> steps</span>\
        <% } %>\
      </li>\
      <li class="steps"><ul>\
        <% if (typeof(steps) != "undefined" && steps != null){ %>\
          <li><%= steps.join("</li><li>") %></li>\
        <% } %>\
        <% if (typeof(public_url) != "undefined"){ %>\
          <li class="public_url"><a href="<%= public_url %>" target="_blank">Show</a></li>\
        <% } %>\
      </ul></li>\
      <% if (typeof(distance) != "undefined"){ %>\
        <li class="distance">Distance: <%= distance %> km</li>\
      <% } %>\
      <li class="actions"><a href="#" class="confirm">Save</a> | <a href="#" class="bookmark">Bookmark</a> | <a href="#" class="destroy">Destroy</a></li>\
      <li class="error"></li>\
    </ul>\
  '),
  unsupported_provider: _.template('\
    <p>Travel provider <%= provider %> not supported by gadget</p>\
  '),
  error: _.template('\
    <p>Sorry, we cannot find a trip with <%= provider %> for <%= travel_type %>, try another address or another time for your trip.</p>\
  '),
  render: function(){
    $(this.el).addClass(this.model.get('provider'));
    $(this.el).addClass(this.model.get('travel_type'));
    if (this.model.get('state') == 'error') {
      $(this.el).append(this.error(this.model.toJSON()));
    }
    else if ($.inArray(this.model.get('provider'), ["google-directions", "ratp"]) != -1) {
      $(this.el).append(this.travel_step(this.model.toJSON()));
    }
    else {
      $(this.el).append(this.unsupported_provider(this.model.toJSON()));
    }
    return this;
  },
  destroy: function(event){
    event.preventDefault();
    var self = this;
    this.waitForAction('destroy');
    this.model.destroy({
      success: self.successOnDestroy,
      error: self.errorOnDestroy
    });
  },
  confirm: function(event){
    event.preventDefault();
    this.waitForAction('confirm');
    var self = this;
    this.model.confirm({
      success: self.successOnConfirm,
      error: self.errorOnConfirm
    });
  },
  bookmark: function(event){
    event.preventDefault();
    this.waitForAction('bookmark');
    var self = this;
    this.model.bookmark({
      success: self.successOnBookmark,
      error: self.errorOnBookmark
    });
  },
  removeSameTravelSteps: function(){
    var self = this;
    $('.travel_step.' + this.model.get('travel_type')).each(function(){
      if($(self.el).get(0) != this && !$(this).hasClass('lock')){
        $(this).remove();
      }
    });
  },
  toggleSteps: function(event){
    event.preventDefault();
    this.$('.steps').toggle();
    this.$('.steps_toggle').toggleClass('on');
    this.$('.steps_toggle').toggleClass('off');
  },
  successOnConfirm: function(){
    this.lock();
    this.removeSameTravelSteps();
    google.calendar.refreshEvents();
    $(this.el).html("<p>Please check your inbox</p>");
    gadgets.window.adjustHeight();
  },
  successOnDestroy: function(){
    this.lock();
    google.calendar.refreshEvents();
    $(this.el).html("<p>Travel canceled</p>");
    gadgets.window.adjustHeight();
  },
  successOnBookmark: function(){
    this.lock();
    this.removeSameTravelSteps();
    google.calendar.refreshEvents();
    gadgets.window.adjustHeight();
    this.$('.bookmark').show();
    this.$('.loader').remove();
  },
  errorOnConfirm: function(){
    this.$('.loader').remove();
    this.$('.confirm').show();
    this.$('.error').html("An error occurred while confirmation of your trip");
  },
  errorOnDestroy: function(){
    this.$('.loader').remove();
    this.$('.destroy').show();
    this.$('.error').html("An error occurred while deleting your trip");
  },
  errorOnBookmark: function(){
    this.$('.loader').remove();
    this.$('.bookmark').show();
    this.$('.error').html("An error occurred while bookmarking your trip");
  },
  clearError: function(){
    this.$('.error').html("");
  },
  waitForAction: function(action){
    this.clearError();
    $(this.loader).insertAfter(this.$('.' + action + ''));
    this.$('.' + action + '').hide();
  },
  lock: function(){
    $(this.el).addClass('lock');
  }
});

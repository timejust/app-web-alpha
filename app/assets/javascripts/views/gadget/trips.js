App.Views.TripsView = Backbone.View.extend({
  className: 'trips',

  render: function() {
    var self = this;
    $(this.el).html(this.trips({
      trip_green: this.trip_green(),
      trip_pink: this.trip_pink(),
      trip_yellow: this.trip_yellow()
      }));    
    return this;
  },
  trips: _.template('\
    <div class="trips">\
      <%= trip_green%>\
      <%= trip_pink%>\
      <%= trip_yellow%>\
    </div>\
  '),
  // Template to show head box with schedule information
  trip_green: _.template('\
    <div class="green">\
      <ul>\
        <li><a class="green_toggle off" href="#"></a></li>\
        <li class="event_title">test</li>\
      </ul>\
      <ul>\
        <li class="address">test</li>\
      </ul>\
    </div>\
  '),
  // Template to show head box with schedule information
  trip_pink: _.template('\
    <div class="pink">\
      <ul>\
        <li><a class="pink_toggle off" href="#"></a></li>\
        <li class="event_title">test</li>\
      </ul>\
      <ul>\
        <li class="address">test</li>\
      </ul>\
    </div>\
  '),
  // Template to show head box with schedule information
  trip_yellow: _.template('\
    <div class="yellow">\
      <ul>\
        <li><a class="yellow_toggle off" href="#"></a></li>\
        <li class="event_title">test</li>\
      </ul>\
      <ul>\
        <li class="address">test</li>\
      </ul>\
    </div>\
  ')
});

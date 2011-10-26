App.Views.TravelView = Backbone.View.extend({
  className: 'travel',
  // render each travel_steps of this travel
  render: function(){
    var self = this;
    if (!this.allTravelStepsInError()) {
      $(this.el).append(this.travel(this.model.toJSON()));
      $.each(this.model.get('travel_steps'), function(index, travel_step_json){
        var view = new App.Views.TravelStepView( { model: new App.Models.TravelStep(travel_step_json) });
        // TODO spec
        $(self.el).append(view.render().el);
      });
    }
    else {
      $(this.el).append(this.travel_not_found({model: this.model}));
    }
    return this;
  },
  allTravelStepsInError: function(){
    var all_in_error = true;
    $.each(this.model.get('travel_steps'), function(index, travel_step_json){
      if (travel_step_json['state'] != 'error'){
        all_in_error = false;
      }
    });
    return all_in_error;
  },
  travel_not_found: _.template('\
    <p>Address not yet supported for <%= model.locomotion() %></p>\
  '),
  travel: _.template('\
    <p class="icon_and_price">\
      <% $.each(transports, function(i, transport){ %>\
        <span class="icon <%= transport %>"></span>\
      <% }); %>\
    </p>\
  ')
});

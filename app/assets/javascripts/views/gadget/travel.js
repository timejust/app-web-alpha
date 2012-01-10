App.Views.TravelView = Backbone.View.extend({
  className: 'travel',
  initialize: function() {
    this.model = null;
  },
  // render each travel_steps of this travel
  render: function() {   
    var travels = this.model.travels;    
    if (travels == null) {
      // display error
    }
    var html = '<div class="travels">';
    $.each(travels, function(i, travel) {
      var color = 'yellow';
      if (travel.calendar == 'YellowProposal') 
        color = 'yellow';
      else if (travel.calendar == 'GreenProposal') 
        color = 'green';
      else if (travel.calendar == 'PinkProposal') 
        color = 'pink';      
      var step = travel.travel_steps[0];
      html += '<div class="' + color + '"><ul class="travel"><li><a class="';
      html += color + '_toggle off" href="#"></a></li>';
      html += '<li class="title">' + travel.travel_mode + '</li></ul>';
      html += '<ul><li class="' + color +'_estimate">' + step.estimated_time + '\'</li>';
      html += '<div class="transportation_symbol">';
      if (travel.travel_mode == 'car') {
        html += '<li class=car></li><li>' + step.distance + '</li>'
      } else {
        var current_mode = "";
        $.each(step.steps, function(i, s) {
          var mode = "";
          if (s.line == 'connections' || s.line == 'base' || s.line == '') {
            mode = "walk";
          } else if (s.line.indexOf('metro')) {
            mode = "metro";
          } else if (s.line.indexOf('bus')) {
            mode = "bus";
          }
          if (current_mode != mode) {
            html += '<li class="' + mode + '"></li>';  
          }
          current_mode = mode;          
        })
      }
      html += '</div></ul></div>';
    });
    html += "</div>";
    $(this.el).html(html);     
  }
  /*  
  travel: _.template('\
    <p class="icon_and_price">\
      <% $.each(transports, function(i, transport){ %>\
        <span class="icon <%= transport %>"></span>\
      <% }); %>\
    </p>\
  ')
  */
});

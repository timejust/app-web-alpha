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
        html += '<li class="car"';
        if (step.estimated_time < 10) {
          html += ' style="margin-left:10px"';
        }
        html += '></li><li class="distance">' + step.distance + '</li>';
      } else {        
        var current_mode = "";
        var num_icons = 0;
        $.each(step.steps, function(i, s) {
          var mode = current_mode;
          if (s.line == 'base' || s.line == '') {
            mode = "walk";
          } else if (s.line.indexOf('metro') != -1) {
            mode = "metro";
          } else if (s.line.indexOf('bus') != -1) {
            mode = "bus";
          } else if (s.line == 'connections' && i == step.steps.length - 1) {
            mode = "walk";
          }          
          if (current_mode != mode) {
            num_icons += 1;
          }
          current_mode = mode;          
        })   
        current_mode = "";     
        $.each(step.steps, function(i, s) {
          var mode = current_mode;
          if (s.line == 'base' || s.line == '') {
            mode = "walk";
          } else if (s.line.indexOf('metro') != -1) {
            mode = "metro";
          } else if (s.line.indexOf('bus') != -1) {
            mode = "bus";
          } else if (s.line == 'connections' && i == step.steps.length - 1) {
            mode = "walk";
          }          
          if (current_mode != mode) {
            html += '<li class="' + mode;
            if (i != 0) {
              html += '" style="margin-left: ' + (100 - (num_icons * 20)) / (num_icons - 1) + 'px';
            }
            html += '"></li>';              
          }
          current_mode = mode;          
        });
      }
      html += '</div></ul><div class="steps">';
      if (travel.travel_mode == 'car') {
        $.each(step.steps, function(i, s) {
          html += '<ul class="step"';
          if (i == 0) {
            html += ' style="border-top: 0px"';
          }
          html += '><li class="where"></li><li class="direction"';
          if (i == 0) {
            html += ' style="font: bold 10px Arial"';
          }
          html += '>' + s.text_direction + '</li></ul>';
        });
      } else {
        $.each(step.steps, function(i, s) {
          html += '<ul class="step"';
          if (i == 0) {
            html += ' style="border-top: 0px"';
          }
          html += '><div class="direction_block"><li class="where"></li><li class="direction">' + s.dep_name + '</li></div>';
          html += '<div class="direction_block"><li class="where"></li><li class="direction">' + s.arr_name + '</li></div></ul>';
        });
      }
      html += '</div></div>';
    });
    html += "</div>";
    $(this.el).html(html);   
    $(this.el).find('.steps').hide();      
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

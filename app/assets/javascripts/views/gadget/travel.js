App.Views.TravelView = Backbone.View.extend({
  className: 'travel',
  initialize: function() {
    this.model = null;
    this.rendered = false;
  },
  clear: function() {
    this.model = null;
    this.rendered = false;
  },
  // render each travel_steps of this travel
  render: function() {   
    var travels = this.model.travels;   
    var arrival_address = this.model.current_travel_node.address;
    var self = this; 
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
          } else if (s.line.indexOf('rer') != -1) {
            mode = "train";                      
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
          } else if (s.line.indexOf('rer') != -1) {
            mode = "train";                      
          } else if (s.line == 'connections' && i == step.steps.length - 1) {
            mode = "walk";
          }       
          if (current_mode != mode) {            
            if (i != 0) {
              html += '<li class="gray_bar" style="width: ' + (100 - (num_icons * 19)) / (num_icons - 1) + 'px"></li>'
            }
            html += '<li class="' + mode + '"></li>';
          }
          current_mode = mode;          
        });
      }
      html += '</div></ul><div class="steps">';
      var distance = 0;
      if (travel.travel_mode == 'car') {
        $.each(step.steps, function(i, s) {
          html += '<ul class="step"';
          if (i == 0) {
            html += ' style="border-top: 0px"';
          }          
          html += '><li class="where">';
          html += Math.floor(Math.round(parseFloat(s.distance) / 100)) / 10 + 'km</li><li class="direction">';
          html += s.text_direction + '</li></ul>';
        });
      } else {
        var departure_time = "";
        var departure_name = "";
        var arrival_name = "";
        $.each(step.steps, function(i, s) {
          if (s.line == "base") {
            departure_time = s.dep_time;            
          } else {
            if (s.line == "connections") {              
              departure_name = "Walk to";  
              if (departure_time == "")
                departure_time = s.dep_time;              
            } else {
              departure_name = s.line + " " + s.headsign;
              departure_time = s.dep_time; 
            }
            if (s.line != "connections" || s.arr_name != "" || i == step.steps.length - 1) {            
              html += '<ul class="step"';
              if (i == 1) {
                html += ' style="border-top: 0px"';
              }
              html += '><ul class="direction_block"><li class="where"';
              if (i == 1) {
                html += ' style="color: #ffffff"';
              }
              html += '>' + self.convertTimeformat(departure_time);
              html += '</li><li class="direction">' + departure_name + '</li></ul>';
              html += '<ul class="direction_block"><li class="where"';
              if (i == step.steps.length - 1) {
                html += ' style="color: #ffffff"';
              }
              html += '>' + self.convertTimeformat(s.arr_time);
              if (s.arr_name == "") {
                arrival_name = arrival_address;
              } else {
                arrival_name = s.arr_name
              }
              html += '</li><li class="direction">' + arrival_name + '</li></ul></ul>'; 
              departure_time = "";
              departure_name = "";
              arrival_name = "";
            }            
          }          
        });
      }
      html += '</div></div>';
    });
    html += "</div>";
    this.rendered = true;
    $(this.el).html(html); 
        
    /*  
    $(this.el).html(this.layout({
      travels: travels
      }));
      */
    $(this.el).find('.steps').hide();      
  },
  convertTimeformat: function(d) {
    var tok = d.split(' ');
    var hms = tok[1];
    tok = hms.split(':');
    return tok[0] + ":" + tok[1];
  },
  layout: _.template('\
  <div class="travels">\
  <%$.each(travels, function(i, travel) {%>\
    <% var color = "yellow";%>\
  <%});%>\
  </div>\
  ')
});

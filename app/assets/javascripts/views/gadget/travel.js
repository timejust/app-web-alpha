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
  // TODO: refactoring needed....
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
      html += '<div class="' + color + '"><div class="travel_container"><ul class="travel"><li><a class="';
      html += color + '_toggle off" href="#"></a></li>';
      html += '<li class="title">' + travel.travel_mode.toUpperCase() + '</li><a class="plus_container" href="#" id="' + travel._id + '"></a></ul>';
      html += '<ul><li class="' + color +'_estimate">' + step.estimated_time + '\'</li>';
      html += '<div class="transportation_symbol">';
      if (travel.travel_mode == 'car') {
        html += '<li class="walk"';
        if (step.estimated_time < 10) {
          html += ' style="margin-left:10px"';
        }
        var num_icons = 3;
        var gray_width = ((100 - (num_icons * 19)) / (num_icons - 1)) - 18;
        html += '></li>';
        html += '<li class="gray_bar" style="width: ' + gray_width + 'px"></li>';
        html += '<li class="car"></li><div class="distance_container">';
        html += '<div class="distance">' + Math.floor(step.distance).toFixed(1) + 'km</div></div>';
        html += '<li class="gray_bar" style="width: ' + gray_width + 'px"></li>';
        html += '<li class="walk"></li>';
      } else {        
        var current_mode = "";
        var current_line = "";
        var num_icons = 0;
        $.each(step.steps, function(i, s) {
          var mode = current_mode;
          var line = "";
          if (s.line == 'base' || s.line == '') {
            mode = "walk";
          } else if (s.line.indexOf('metro') != -1) {
            mode = "metro";
            line = s.line.substring(5, s.line.length);
          } else if (s.line.indexOf('bus') != -1) {
            mode = "bus";
            line = s.line.substring(3, s.line.length);
          } else if (s.line.indexOf('rer') != -1) {
            mode = "train";       
            line = s.line.substring(3, s.line.length);               
          } else if (s.line == 'connections' && i == step.steps.length - 1) {
            mode = "walk";
          }   
          // We don't display same transportation icon twice in a row       
          if (current_mode != mode) {
            // We don't display walk icon between other icons, only display 
            // when it's in the beginning or end.
            if ((mode != "walk") || (i == 0 || i == step.steps.length - 1)) {
              num_icons += 1;
            } else {
              // Let's pretend this mode doesn't exist.
              mode = current_mode;
            }
          }
          if (line != "") {
            num_icons += 1;
          }
          current_mode = mode;          
        })   
        current_mode = ""; 
        var z = 0;   
        // We need to calcuate overlaid margin if too many icons 
        // exist in the strip.
        var margin_left = Math.round(self.calculateOveray(num_icons));
        var width = Math.round((105 - (num_icons * 19)) / (num_icons - 1));
        
        $.each(step.steps, function(i, s) {
          var mode = current_mode;
          var line = "";
          if (s.line == 'base' || s.line == '') {
            mode = "walk";
          } else if (s.line.indexOf('metro') != -1) {
            mode = "metro";
            line = s.line.substring(5, s.line.length);
          } else if (s.line.indexOf('bus') != -1) {
            mode = "bus";
            line = s.line.substring(3, s.line.length);
          } else if (s.line.indexOf('rer') != -1) {
            mode = "train";                      
            line = s.line.substring(3, s.line.length);
          } else if (s.line == 'connections' && i == step.steps.length - 1) {
            mode = "walk";
          }       
          // We don't display same transportation icon twice in a row
          if (current_mode != mode) {            
            // We don't display walk icon between other icons, only display 
            // when it's in the beginning or end.
            if ((mode != "walk") || (i == 0 || i == step.steps.length - 1)) {
              if (i > 0) {                
                if (width > 0)
                  html += '<li class="gray_bar" style="width: ' + width + 'px"></li>'
              }              
              html += '<li class="' + mode + '" style="z-index: ' + z + '; ';
              if (i != 0) {
                if (margin_left > 0)
                  html += 'margin-left: -' + margin_left + 'px; ';
              }
              html +='"></li>';  
              z += 1;            
            } else {
              // Let's pretend this mode doesn't exist.
              mode = current_mode;
            }             
          }
          if (line != "") {
            if (mode == "bus") {
              html += '<li class="' + mode + '_line" style="z-index: ' + z + '; ';  
            } else {
              html += '<li class="' + mode + '_' + line + '" style="z-index: ' + z + '; ';  
            }            
            if (margin_left > 0)
              html += 'margin-left: -' + margin_left + 'px; ';
            if (mode == "bus") {
              html += '"><div class="bus_line_container">' + line + '</div></li>';
            } else {
              html += '"></li>';
            }
            z += 1;
          }                                    
          current_mode = mode;          
        });
      }
      html += '</div></ul>';
      
      // Display travel steps
      html += '<div class="steps">';
      var distance = 0;
      if (travel.travel_mode == 'car') {
        $.each(step.steps, function(i, s) {
          html += '<ul class="step"';
          if (i == 0) {
            html += ' style="border-top: 0px"';
          }          
          html += '><li class="where">';
          html += (Math.floor(Math.round(parseFloat(s.distance) / 100)) / 10).toFixed(1) + 'km</li><li class="direction">';
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
      html += '</div></div></div>';
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
  calculateOveray: function(icons) {
    if (icons * 19 <= 105)
      return 0;
    return ((icons * 19) - 105) / (icons - 1);
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

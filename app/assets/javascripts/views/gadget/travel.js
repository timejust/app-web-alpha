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
    var departure_address = this.model.previous_travel_node.address;
    var arrival_address = this.model.current_travel_node.address;
    var self = this; 
    var empty = false;
    var availables = new Array();
    var estimated_time = 0;
    var hour_format = false;
    if (travels == null) {
      // display error
    }
    var html = '<div id="travel_container" class="travels">';
    $.each(travels, function(i, travel) {
      var color = 'yellow';
      if (travel.calendar == 'xTimejustYellow') 
        color = 'yellow';
      else if (travel.calendar == 'xTimejustGreen') 
        color = 'green';
      else if (travel.calendar == 'xTimejustPink') 
        color = 'pink';      
      var step = travel.travel_steps[0];
      if (step == null || step.state == "error") {
        empty = true;
        return;
      }      
      availables.push(travel)
      // We don't want to display train as a title. If travel mode is 'train', let's change
      // to 'rail' instead
      if (travel.travel_mode == 'train') {
        travel.travel_mode = 'rail'
      }
      estimated_time = step.estimated_time + "'";
      hour_format = false;
      if (step.estimated_time > 90) {
        estimated_time = parseInt(step.estimated_time / 60) + "h";
        if ((step.estimated_time % 60) <= 10) {
          estimated_time += "0" + (step.estimated_time % 60);
        } else {
          estimated_time += (step.estimated_time % 60);
        }
        hour_format = true;
      }
      html += '<div class="' + color + '"><div class="travel_container"><ul class="travel"><li class="toggle"><a class="';
      html += color + '_toggle off" href="#"></a></li>';
      html += '<li><a class="travel_title" href="#"><div class="title">' + travel.travel_mode.toUpperCase() + '</div></a></li>';      
      html += '<a class="plus_container" href="#" id="' + travel._id + '"></a></ul>';
      html += '<div id="tooltip_' + travel._id + '" class="tooltip">copy to my calendar</div>';
      html += '<ul><li class="' + color +'_estimate">' + estimated_time + '</li>';
      html += '<div class="transportation_symbol"';
      if (hour_format) {
        html += ' style="margin-left: 1px;"';
      }  
      html += '>';
      if (travel.travel_mode == 'car') {
        html += '<li class="walk" style="';
        var margin = 0;
        if (step.estimated_time < 10) {
          html += 'margin-left:10px;';
        }
        if (step.estimated_time > 100) {
          margin = 5;
        }        
        var num_icons = 3;
        var step_width = 34;
        if (step.distance > 10 && step.distance < 100) {
          step_width = 39;
        } 
        if (step.distance > 100) {
          step_width = 44;
        }        
        var margin_left = ((57 + step_width + 5) - (105 - margin)) / 2;        
        var gray_width = ((105 - margin - (num_icons * 19) - step_width) / (num_icons - 1));
        html += 'z-index: 5;"></li>';
        html += '<li class="gray_bar" style="width: ' + gray_width + 'px; z-index: 4;"></li>';
        html += '<li class="car" style="z-index: 3;';
        if (margin_left > 0)
          html += 'margin-left: -' + margin_left + 'px; ';
        html += '"></li>';
        html += '<div class="distance_container" style="width: ' + (step_width + 5) + 'px; z-index: 2;">';
        html += '<div class="distance">' + Math.floor(step.distance).toFixed(1) + 'km</div></div>';
        html += '<li class="gray_bar" style="width: ' + gray_width + 'px; z-index: 1"></li>';
        html += '<li class="walk" style="z-index: 0;';
        if (margin_left > 0)
          html += 'margin-left: -' + margin_left + 'px;';
        html += '"></li>';
      } else {        
        var current_mode = "";
        var current_line = "";
        var num_icons = 0;
        var num_transport_icons = 0;
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
          } else if (s.line.indexOf('transilien') != -1) {
            mode = "transilien";
            line = s.line.substring(10, s.line.length);
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
            // num_icons += 1;
            num_transport_icons += 1;
          }
          current_mode = mode;          
        })   
        current_mode = ""; 
        var z = 0;   
        // We need to calcuate overlaid margin if too many icons 
        // exist in the strip.
        var transportation_strip_width = 105;
        if (hour_format)
          transportation_strip_width -= 6;
        var margin_left = Math.round(self.calculateOverlay(
          transportation_strip_width, num_icons, num_transport_icons));
        var width = (transportation_strip_width - (num_icons * 19 + num_transport_icons * 16)) / 
          ((num_icons) - 1);
        
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
          } else if (s.line.indexOf('transilien') != -1) {
            mode = "transilien";
            line = s.line.substring(10, s.line.length);
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
    
    if (empty == true && availables.length == 0) {
      html += "<div class='error'>Journey from " + departure_address + " to " + arrival_address + " soon available in Timejust</div>"
    }
    
    html += "</div>";
    this.rendered = true;
    $(this.el).html(html); 
    
    $.each(availables, function(i, a){
      $("#travel_container #" + a._id).tooltip({
        tip: "#tooltip_" + a._id
      });  
    })
    /*
    // $("#travel_container a[title]").tooltip();      
    $("#travel_container a").tooltip({
     tipClass:  
    });
    */      
        
    /*  
    $(this.el).html(this.layout({
      travels: travels
      }));
      */
    $(this.el).find('.steps').hide();      
  },
  calculateOverlay: function(width, icons, transport_icons) {
    if ((icons * 19 + transport_icons * 16) <= width)
      return 0;
    return ((icons * 19 + transport_icons * 16) - width) / (icons + transport_icons - 1);
  },
  convertTimeformat: function(d) {
    var tok = d.split('T');
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

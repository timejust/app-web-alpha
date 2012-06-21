App.Views.EventSummaryView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'handleNavigateUp'); 
    _.bindAll(this, 'handleNavigateDown'); 
    _.bindAll(this, 'handlePreviousEventCallback');
    _.bindAll(this, 'handleNextEventCallback');
    this.prefix = this.options.prefix;
    this.stage = this.options.stage;
    this.el = this.options.el;
    this.email = this.options.email;        
    this.selected = -1;
    this.summarized = true;
    this.color = null;
    this.title = '';
    this.address = '';
    this.lat = 0.0;
    this.lng = 0.0;
    this.normalized = false;
    this.kMaxLength = 21;
    this.classType = "event";  
    this.previousEvent = null;
    this.nextEvent = null;
    this.selectedEvent = null;
    this.startTime = null;
    this.endTime = null;
    this.summary = null;
  },  
  bind: function(summary) {
    this.summary = summary;
    if (this.summary.calendarEvent != null) {
      this.startTime = this.summary.calendarEvent.startTime;
      this.endTime = this.summary.calendarEvent.endTime;  
    }    
  },
  setAliasClassType: function() {
    this.classType = "alias";
  },
  setCurrentEvent: function() {
    this.classType = "current";
  },
  appendAddressBook: function(address, lat, lng, normalized) {
    if (this.summary != undefined) {
      return this.summary.appendAddressBook(address, lat, lng, normalized);
    }
    return -1;
  },
  appendAlias: function(title, address, lat, lng) {
    if (this.summary != undefined) {
      return this.summary.appendAlias(title, address, lat, lng);
    }
    return -1;
  },
  selectAliasItem: function(title) {
    if (this.summary != undefined) {
      this.selected = this.summary.getIndexOfAliasByTitle(title);
    }
  },
  deleteAlias: function(title) {
    if (this.summary != undefined) {
      this.summary.deleteAlias(title);
    }
  },
  clear: function() {
    this.title = '';
    this.address = '';
    this.lat = 0.0;
    this.lng = 0.0;
    this.normalized = false;
    this.selected = -1;
    this.summary = null;
    this.startTime = null;
    this.endTime = null;
    this.summary = null;    
  },
  render: function() {
    var self = this;
    var alias_index = -1;
    var class_name = "white";
    var border_color = "#DDDDDD";    
    if (this.summary.title == null) {
      // If title is null, there is no proper event to show. In this case,
      // let's display just alias and history list instead of events.
      // And display title of first alias for the title of summary instead of
      // event title.      
      class_name = 'white';
      if (this.selected >= 0) {
        // We assume this event does not have proper address book.        
        alias_index = this.selected;
        if (this.summary.addressBook.length > 0) {
          alias_index = alias_index - this.summary.addressBook.length;
        }
      } else {
        // If there is no event, we should display alias as a default value here
        // if alias exists.
        this.selected = 0;
        alias_index = 0;        
      }
      
      // If selected item is one of existing alias list.     
      if (this.summary.alias.length > 0 && alias_index >= 0) {
        if (this.prefix != undefined) {
          this.title = this.prefix + " " + this.summary.alias[alias_index].title;    
        } else {
          this.title = this.summary.alias[alias_index].title;      
        }        
        this.lat = this.summary.alias[alias_index].lat;
        this.lng = this.summary.alias[alias_index].lng;
        this.address = this.summary.alias[alias_index].address;
        this.normalized = true;
      } else {
        // If the item is coming from the alias without title..
        if (this.prefix != undefined) {
          this.title = this.prefix;
        } 
        if (this.summary.addressBook.length > 0) {
          this.lat = this.summary.addressBook[this.selected].lat;
          this.lng = this.summary.addressBook[this.selected].lng;
          this.address = this.summary.addressBook[this.selected].address;
          this.normalized = true;
        }
      }    
    } else {
      if (this.classType == "alias") {
        class_name = 'white';   
      } else {
        class_name = 'blue';     
      }      
      this.title = this.summary.title;
      var ab = null;
      if (this.selected == -1) {
        if (this.summary.addressBook.length > 0) {
          ab = this.summary.addressBook[0];
          this.selected = 0;
        } else if (this.summary.selected > -1) {
          ab = this.summary.alias[this.summary.selected];
          this.selected = this.summary.selected;
          ab.normalized = true;
        }
      } else {
        // We look up from address book first and alias book later.
        if (this.summary.addressBook.length > this.selected) {
          ab = this.summary.addressBook[this.selected];
        } else {
          if (this.selected >= this.summary.addressBook.length) {
            ab = this.summary.alias[this.selected - this.summary.addressBook.length];
            if (ab != null)          
              ab.normalized = true;  
          }          
        }
      }    
      if (ab != null) {
        this.address = ab.address;
        this.lat = ab.lat;
        this.lng = ab.lng;
        this.normalized = ab.normalized;
      }                
    } 
    if (this.classType == "current") {
      border_color = "#000000";
    }     
    var title = this.title;
    var address = this.address;        
    var toggle_on = (this.summary.alias.length > 0 || this.summary.addressBook.length > 0);
    var id = 0;    
    $(this.el).html(this.layout({
      class_name: class_name, 
      color: this.summary.color,
      title: title,
      address: address,
      addressBook: this.summary.addressBook,
      selected: this.selected,
      id: id,
      alias: this.summary.alias,
      borderColor: border_color,
      toggleOn: toggle_on,
      stage: this.stage
      }));
    if (toggle_on)
      $(this.el).find('.aliases').hide();   
    
    // Set up click event handler for arrows.
    $(this.el).find('.navigation_up').click(this.handleNavigateUp);     
    $(this.el).find('.navigation_down').click(this.handleNavigateDown);
    /*
    if (this.stage == "previous") {
      // If the stage is previous: try to find an event from beginning of day 
      // before until right before current event begins
      if (this.startTime != null) {
        GoogleEventReader.getInstance().read(
          this.email, this.startTime, -2, 
          this.handlePreviousEventCallback, true);              
      }
      if (this.endTime != null) {
        GoogleEventReader.getInstance().readEvent(
          this.email, this.endTime, this.selectedEvent.startTime, 
          this.handleNextEventCallback);    
      }                            
    } else if (this.stage == "next") {
      // If the stage is next: try to find an event from right after the current
      // event finishes until end of the next day.    
      if (this.startTime != null) {
        GoogleEventReader.getInstance().readEvent(
          this.email, this.selectedEvent.endTime, this.startTime, 
          this.handlePreviousEventCallback);                                        
      }  
      if (this.endTime != null) {
        GoogleEventReader.getInstance().read(
          this.email, this.endTime, 2, 
          this.handleNextEventCallback, true);  
      }      
    }  
    */      
  },
  handlePreviousEventCallback: function(response, params) {
    if (response != null && response[0] != null) {
      var events = response[0]['events'];
      if (events.length > 0) {
        $(this.el).find('#navigation_arrow_up_container').toggleClass('on');
        $(this.el).find('#navigation_arrow_up_container').toggleClass('off');         
        this.previousEvent = events[0];
      } 
    }    
  },
  handleNextEventCallback: function(response, params) {
    if (response != null && response[0] != null) {
      var events = response[0]['events'];
      if (events.length > 0) {
        $(this.el).find('#navigation_arrow_down_container').toggleClass('on');
        $(this.el).find('#navigation_arrow_down_container').toggleClass('off');
        this.nextEvent = events[0];
      } 
    }    
  },
  registerEventChangeHandler: function(handler) {
    this.eventChangeHandler = handler;
  },
  handleNavigateUp: function(e) {
    alert(this.previousEvent.title);
  // this.eventChangeHandler()
  },
  handleNavigateDown: function(e) {
  //
    alert(this.nextEvent.title); 
  },
  layout: _.template('\
  <div class="<%=class_name%>" style="border-color:<%=borderColor%>;<%if (color != null) { %>background-color:<%=color%> <%}%>">\
    <ul class="event">\
      <div class="top_toggle_container">\
        <li class="toggle">\
          <a class="gray_toggle <% if (toggleOn == false) { %>on<% } else { %>off<% } %>" href="#"></a>\
          </li>\
      </div>\
      <div class="top_title_container">\
        <a class="top" href="#">\
          <div class="title" shorten="true"><%=title%></div>\
        </a>\
        <a class="top" href="#">\
          <li class="address" shorten="true"><%=address%></li>\
        </a>\
      </div>\
      <div class="navigation_arrow_container" id="navigation_arrow_container">\
        <div class="navigation_up off" id="navigation_arrow_up_container" />\
        <div class="navigation_down off" id="navigation_arrow_down_container" />\
      </div>\
      <div class="aliases">\
        <% $.each(addressBook, function(i, ab) { %>\
          <div class="alias_container">\
            <li class="alias" style="<% if (selected == id) { %>font-weight: bold<% } %>">\
              <a href="#" id="<%=id%>" class="value"><%=ab.address%></a>\
            </li>\
          </div>\
        <% id += 1;}); %>\
        <% $.each(alias, function(i, ab) { %>\
          <div class="alias_container">\
            <li class="alias" style="<% if (selected == id) { %>font-weight: bold<% } %>">\
              <a href="#" id="<%=id%>" class="value" alias="true"><%=ab.title%>,</a>\
            </li>\
            <li class="alias_address" style="width:<%if (95-((ab.title.length - 2) * 4) > 0) {%>\
              <%=95-((ab.title.length - 2) * 4)%><%} else {%><%=0%><%}%>px"><%=ab.address%></li>\
          </div>\
        <% id += 1;}); %>\
        <div class="alias_container">\
          <li class="alias"><a href="#" selector="true" class="value">\
          <% if (alias.length > 0 || addressBook.length > 0) { %>else where<% } else {%>tell us where<%}%></a></li>\
        </div>\
      </div>\
    </ul>\
  </div>\
  ')
});
  
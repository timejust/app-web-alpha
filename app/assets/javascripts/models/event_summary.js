App.Models.EventSummary = Backbone.Model.extend({
  initialize: function() {
    this.alias = this.get("alias");
    this.calendarEvent = this.get('calendarEvent');
    this.title = (this.calendarEvent == null ? 
      null : (this.calendarEvent.title == null ? 
        this.calendarEvent.summary : this.calendarEvent.title));
    if (this.calendarEvent != null) {
      // this.color = this.calendarEvent.palette.medium;
      
      // We're using eid instead of id from google calendar event because
      // the given calendar event id is associated with the Google Calendar
      // UI system not with google backend system. In order to hook them up
      // with the given item, we need to use eid in the given object.
      this.googleEventId = (this.calendarEvent.eid == null ? 
        this.calendarEvent.id : this.calendarEvent.eid);
      this.original_address = this.calendarEvent.location;      
    } else {
      this.original_address = "";
    }
    this.addressBook = new Array();
    this.selected = -1;
    this.accessLevel = '';
  },
  appendAddressBook: function(address, lat, lng, normalized) {
    var id = this.addressBook.length;
    $.each(this.addressBook, function(i, ab) {
      if (normalized == true && ab.address == address) {
        id = i;
      }
    });
    if (id == this.addressBook.length) {
      this.addressBook[this.addressBook.length] = {
        title: this.title, address: address, lat: lat, lng: lng, normalized: normalized};        
    }   
    return id;
  },
  setAliasSelect: function(title) {
    var id = -1;
    if (this.alias != null) {
      $.each(this.alias, function(i, a) {
        if (a.title == title) {
          id = i;
        }
      });  
    } 
    this.selected = id;
  },
  getIndexOfAliasByTitle: function(title) {
    var id = -1;
    if (this.alias != null) {
      $.each(this.alias, function(i, a) {
        if (a.title == title) {
          id = i;
        }
      });  
    }
    return id + this.addressBook.length;
  },
  appendAlias: function(title, address, lat, lng) {
    var id = 0;
    if (this.alias != null) {
      id = this.alias.length;    
      $.each(this.alias, function(i, a) {
        if (a.title == title) {
          id = i;
        }
      });  
    } else {
      this.alias = new Array();
    }
    this.alias[id] = {
      title: title, address: address, lat: lat, lng: lng};
    return id + this.addressBook.length;
  },
  deleteAlias: function(title) {
    var self = this;
    if (title == null) {
      return;
    }
    $.each(this.alias, function(i, a) {
      if (a != null && a.title == title) {
        self.alias.splice(i, 1);
        return;
      }
    });
  },
  dump: function() {
    var output = "title: " + this.title;    
    if (this.alias != null) {
      $.each(this.alias, function(i, a) {
        output += "\nalias: title=>" + a.title + ", address=>" + a.address;
        if (this.addressBook != null) {
          $.each(this.addressBook, function(k, ab) {          
            output += "\naddress=> " + ab.address + ", lat=>" + ab.lat + ", lng=>" + 
                ab.lng + ", normalized=>" + ab.normalized;
          });  
        }        
      });
    }
    alert(output);   
  }
});

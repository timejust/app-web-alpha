App.Views.EventSummaryView = Backbone.View.extend({
  initialize: function() {
    this.summary = this.options.summary;
    this.prefix = this.options.prefix;
    this.el = this.options.el;
    this.selected = -1;
    this.summarized = true;
    this.color = null;
    this.title = '';
    this.address = '';
    this.lat = 0.0;
    this.lng = 0.0;
  },
  render: function() {
    var self = this;
    var alias_index = 0;
    var class_name = "white";
    if (this.summary.title == null) {
      // If title is null, there is no proper event to show. In this case,
      // let's display just alias and history list instead of events.
      // And display title of first alias for the title of summary instead of
      // event title.      
      class_name = 'white';
      if (this.selected > 0) {
        // We assume this event does not have proper address book.        
        alias_index = this.selected;
      }      
      if (this.summary.alias.length > 0) {
        if (this.prefix != undefined) {
          this.title = this.prefix + " " + this.summary.alias[alias_index].title;    
        } else {
          this.title = this.summary.alias[alias_index].title;      
        }        
        this.lat = this.summary.alias[alias_index].lat;
        this.lng = this.summary.alias[alias_index].lng;
        this.address = this.summary.alias[alias_index].address;
      }         
    } else {
      class_name = 'blue';   
      this.title = this.summary.title;
      if (this.selected == -1) {
        if (this.summary.addressBook.length > 0) {
          this.address = this.summary.addressBook[0].address;
          this.lat = this.summary.addressBook[0].lat;
          this.lng = this.summary.addressBook[0].lng;          
        }  
      } else {
        // We look up from address book first and alias book later.
        if (this.summary.addressBook.length > this.selected) {
          this.address = this.summary.addressBook[this.selected].address;
          this.lat = this.summary.addressBook[this.selected].lat;
          this.lng = this.summary.addressBook[this.selected].lng;                    
        } else {
          this.address = this.summary.alias[this.selected - this.summary.addressBook.length].title;
          this.lat = this.summary.alias[this.selected - this.summary.addressBook.length].lat;
          this.lng = this.summary.alias[this.selected - this.summary.addressBook.length].lng;                    
        }
      }      
    }      
    var html = '<div class="' + class_name + '" style="';
    var title = this.title;
    var address = this.address;
    if (this.summary.color != null) {
      html += 'background-color:' + this.summary.color;
    }     
    html += '"><ul class="event">';        
    html += '<li><a class="gray_toggle off" href="#"></a></li>';            
    html += '<li class="title" shorten="true" original="' + title + '">' + title.substring(0, 23);
    if (title.length > 23) 
      html += "...";
    html += '</li>';
    html += '<li class="address" shorten="true" original="' + address + '">' + address.substring(0, 21);
    if (address.length > 21)
      html += "...";      
    var id = 0;
    html += '</li><div class="aliases">';    
    $.each(this.summary.addressBook, function(i, ab) {
      html += '<li class="alias" style="';
      if (this.selected == id)
        html += 'font-weight: bold';
      html += '"><a href="#" id="' + id + '" class="value">' + ab.address + '</a></li>';
      id += 1;
    });
    $.each(this.summary.alias, function(i, al) {
      html += '<li class="alias" style="';
      if (this.selected == id)
        html += 'font-weight: bold';
      html += '"><a href="#" id="' + id + '" class="value">' + al.title + '</a></li>';
      id += 1;
    });
    html += '<li class="alias"><a href="#" selector="true" class="value">else where</a></li></div></ul></div>';
    $(this.el).html(html); 
    $(this.el).find('.aliases').hide();    
  }
});

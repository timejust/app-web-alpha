App.Views.TravelSummaryView = Backbone.View.extend({
  initialize: function() {
    this.summary = this.options.summary;
    this.prefix = this.options.prefix;
    this.el = this.options.el;
    this.selected = -1;
    this.summarized = true;
    this.color = null;
  },
  render: function() {
    var self = this;
    var title = "";
    var address = "";
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
          title = this.prefix + " " + this.summary.alias[alias_index].title;      
        } else {
          title = this.summary.alias[alias_index].title;      
        }        
        address = this.summary.alias[alias_index].address;
      }         
    } else {
      class_name = 'blue';   
      title = this.summary.title;
      if (this.selected == -1) {
        if (this.summary.addressBook.length > 0) {
          address = this.summary.addressBook[0].address;
        }  
      } else {
        // We look up from address book first and alias book later.
        if (this.summary.addressBook.length > this.selected) {
          address = this.summary.addressBook[this.selected].address;
        } else {
          address = this.summary.alias[this.selected - this.summary.addressBook.length].title;
        }
      }      
    }      
    var html = '<div class="' + class_name + '" style="';
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
    if (this.summary.addressBook.length > 0) {
      for (var i = 0; i < this.summary.addressBook.length; ++i) {
        html += '<li class="alias" style="';
        if (this.selected == id)
          html += 'font-weight: bold';
        html += '"><a href="#" id="' + id + '" class="value">' + this.summary.addressBook[i].address + '</a></li>';
        id += 1;
      }
    }    
    if (this.summary.alias.length > 0) {
      for (var i = 0; i < this.summary.alias.length; ++i) {
        html += '<li class="alias" style="';
        if (this.selected == id)
          html += 'font-weight: bold';
        html += '"><a href="#" id="' + id + '" class="value">' + this.summary.alias[i].title + '</a></li>';
        id += 1;        
      }
    }
    html += '<li class="alias"><a href="#" selector="true" class="value">else where</a></li></div></ul></div>';
    $(this.el).html(html); 
    $(this.el).find('.aliases').hide();    
  }
});

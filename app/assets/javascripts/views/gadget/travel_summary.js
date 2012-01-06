App.Views.TravelSummaryView = Backbone.View.extend({
  initialize: function() {
    this.summary = this.options.summary;
    this.prefix = this.options.prefix;
  },
  render: function() {
    var self = this;
    var title = "";
    var address = "";
    var alias_index = 0;
    var html = '<ul class="event">';
    if (this.summary.title == null) {
      // If title is null, there is no proper event to show. In this case,
      // let's display just alias and history list instead of events.
      // And display title of first alias for the title of summary instead of
      // event title.      
      this.el.className = 'white';
      if (this.summary.alias.length > 0) {
        if (this.prefix != undefined) {
          title = this.prefix + " " + this.summary.alias[alias_index].title;      
        } else {
          title = this.summary.alias[alias_index].title;      
        }        
        address = this.summary.alias[alias_index].address;
        alias_index += 1;
      }   
    } else {
      this.el.className = 'blue';   
      title = this.summary.title;
      if (this.summary.addressBook.length > 0) {
        address = this.summary.addressBook[0].address;
      }      
    }             
    // html += '<li><a class="' + this.el.className + '_toggle off" href="#"></a></li>';        
    html += '<li><a class="blue_toggle off" href="#"></a></li>';        
    html += '<li class="title" shorten="true" original="' + title + '">' + title.substring(0, 23);
    if (title.length > 23) 
      html += "...";
    html += '</li>';
    html += '<li class="address" shorten="true" original="' + address + '">' + address.substring(0, 21);
    if (address.length > 21)
      html += "...";
    html += '</li>';    
    html += '<div class="aliases">';
    if (this.summary.addressBook.length > 1) {
      for (var i = 1; i < this.summary.addressBook.length; ++i) {
        html += '<li class="alias"><div class="value">' + this.summary.addressBook[i].address + '</div></li>';
      }
    }    
    if (this.summary.alias.length > 0) {
      for (var i = alias_index; i < this.summary.alias.length; ++i) {
        html += '<li class="alias"><div class="value">' + this.summary.alias[i].title + '</div></li>';
      }
    }
    html += '<li class="alias"><div class="value">else where</div></li>';
    html += '</div>';
    html += '</ul>';
    $(this.el).html(html); 
    $(this.el).find('.aliases').hide();
    return this.el.outerHTML;
  }
});

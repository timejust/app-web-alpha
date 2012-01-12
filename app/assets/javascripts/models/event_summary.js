App.Models.EventSummary = Backbone.Model.extend({
  initialize: function() {
    this.alias = this.get("alias");
    this.title = this.get("title");
    this.color = null;
    this.googleEventId = '';
    this.addressBook = new Array();
  },
  append: function(address, lat, lng, normalized) {
    this.addressBook[this.addressBook.length] = {
      title: this.title, address: address, lat: lat, lng: lng, normalized: normalized};            
  },
  dump: function() {
    var output = "title: " + this.title;    
    if (this.alias != undefined) {
      $.each(this.alias, function(i, a) {
        output += "\nalias: title=>" + a.title + ", address=>" + a.address;
        $.each(this.addressBook, function(k, ab) {          
          output += "\naddress=> " + ab.address + ", lat=>" + ab.lat + ", lng=>" + 
              ab.lng + ", normalized=>" + ab.normalized;
        });
      });
    }
    alert(output);   
  }
});

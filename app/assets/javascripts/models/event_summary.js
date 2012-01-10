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
      address: address, lat: lat, lng: lng, normalized: normalized};            
  },
  dump: function() {
    var output = "title: " + this.title;    
    if (this.alias != undefined) {
      for (var i = 0; i < this.alias.length; ++i) {
        output += "\nalias: title=>" + this.alias[i].title + ", address=>" + this.alias[i].address;
        for (var k = 0; k < this.addressBook.length; ++k) {
          var ab = this.addressBook[k];
          output += "\naddress=> " + ab.address + ", lat=>" + ab.lat + ", lng=>" + 
              ab.lng + ", normalized=>" + ab.normalized;
        }
      }         
    }
    alert(output);   
  }
});

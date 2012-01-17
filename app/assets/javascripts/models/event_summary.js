App.Models.EventSummary = Backbone.Model.extend({
  initialize: function() {
    this.alias = this.get("alias");
    this.title = this.get("title");
    this.color = null;
    this.googleEventId = '';
    this.addressBook = new Array();
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
  appendAlias: function(title, address, lat, lng) {
    var id = this.alias.length;
    $.each(this.alias, function(i, a) {
      if (a.title == title) {
        id = i;
      }
    });
    this.alias[id] = {
      title: title, address: address, lat: lat, lng: lng};
    return id + this.addressBook.length;
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

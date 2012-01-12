App.Views.TravelNodesSelectorView = Backbone.View.extend({
  events: {
    'submit form'                   : 'saveNewAddress',
    'click .google_maps'            : 'openGoogleMaps',
  },
  initialize: function(){
    // _.bindAll(this, 'waitForTravelNodes');
    this.ip = this.options.ip;
    this.ab = eval('(' + $.cookie('ab') + ')');
    this.alias = eval('(' + $.cookie('alias') + ')');
    this.render();
    // this.base = this.options.base;
    // this.waitForTravelNodes();       
  },
  getGeoAutocomplete: function(node) {
    $('#' + node).geo_autocomplete(new google.maps.Geocoder, {
      mapkey: 'ABQIAAAAbnvDoAoYOSW2iqoXiGTpYBTIx7cuHpcaq3fYV4NM0BaZl8OxDxS9pQpgJkMv0RxjVl6cDGhDNERjaQ', 
  		selectFirst: false,
  		minChars: 3,
  		cacheLength: 50,
  		width: 400,
  		scroll: true,
  		scrollHeight: 300,
  		autoFill: true
  	}).result(function(_event, _data) {
  	  if (_data) {
  	    this.value = _data.formatted_address;
        var lng = _data.geometry.location.Ra
        var lat = _data.geometry.location.Qa                
	    }
	  });
  }, 
  default_layout: _.template('\
  <ul class="top"></ul>\
  <div class="left"></div>\
  <div class="right"></div>\
  '),
  top_template: _.template('\
  <div class="logo"></div>\
  <div class="search_box">\
    <div class="search"><input class="keyword" name="q" maxlength="2048" size="28" id="maininput" placeholder="Search Location" /></div>\
    <div class="search_button"><div class="button-outer_block"><div class="search_button_content"></div></div></div>\
  </div>\
  '),
  // global template for form
  form_template: _.template("\
    <%= title %>\
    <form width=400px action=\"#\">\
      <%= inputs %>\
      <div style=\"text-align:left\"><input type=\"submit\" value=\"Next\" class=\"next\"/></div>\
    </form>\
  "),
  // Template for each travel node confirmation
  input_template: _.template("\
    <div class=\"travel_node\">\
    <h2><%= label_type %>:</h2>\
    <div class=\"history\">\
    <% if (options != '') { %>\
      <p>\
        <select name=\"address\" class=\"selected_address\"><%= options %></select>\
        <input type=\"button\" value=\"Maps\" class=\"google_maps\"/>\
        <span class=\"favorite\">Add it to favorite: <input type=\"text\" name=\"alias\" placeholder=\"alias\"/></span>\
      </p>\
    <% } %>\
    </div>\
    <p class=\"other_address\">Or enter: <input type=\"text\" size=\"30\" id=\"<%= name %>\" name=\"address\" placeholder=\"address\"/></p>\
    </div>\
  "),
  title_template: _.template("\
    <ul class=\"travel_title\"><li class=\"prefix\">New address</li><li class=\"title_address\">selection page</li></ul>\
  "),
  // Template for option elements
  option_template: _.template("<option value=\"<%= value %>\" <%= selected %> data-cached=\"1\" data-lat=\"<%=lat%>\" data-lng=\"<%=lng%>\" data-has-normalized=\"<%=has_normalized%>\" data-event-google-id=\"<%= event_id %>\"><%= label %></option>"),
  // Return the form inputs for a given travel node
  formInputsFor: function(travel_nodes_type, name){
    var self = this;
    var options = "";
    var inputs = "";
    // var selected_address = this.model.get(travel_nodes_type);
    $.each(this.ab, function(i, ab) {
      options += self.option_template( {
        value: ab.address,
        label: (ab.title ? ab.title + ' - ' + ab.address : ab.address),
        // selected: (selected_address && selected_address.address == e.address ? 'selected' : ''),
        selected: '',
        event_id: '',
        has_normalized: '1',
        lat: ab.lat,
        lng: ab.lng
      });
    });    
    $.each(this.alias, function(i, a) {
      options += self.option_template( {
        value: a.address,
        label: (a.title ? a.title + ' - ' + a.address : a.address),
        // selected: (selected_address && selected_address.address == e.address ? 'selected' : ''),
        selected: '',
        event_id: '',
        has_normalized: '1',
        lat: a.lat,
        lng: a.lng
      });
    });    
    inputs += this.input_template( { 
      label_type: this.travel_nodes_type_label(), options: options, name: name } );      
    return inputs;
  },
  travel_nodes_type_label: function(){
    if (this.ab.length > 0) {
      return this.ab[0].title;
    }
    return "Address";   
  },
  // render the form for all travel nodes
  render: function(){
    $(this.el).html(this.default_layout);
    var top = $(this.el).find('.top');
    top.html(this.top_template);
    this.getGeoAutocomplete('maininput');
    /*
    $(this.el).html(this.form_template({
      title: this.title_template(),
      inputs: // this.formInputsFor('previous_travel_node', 'previous_location') + 
        this.formInputsFor('current_travel_node', 'current_location')
        // this.formInputsFor('next_travel_node', 'next_location')
    }));
    this.getGeoAutocomplete('current_location');
    // this.disableAllSearchSubmit();
    this.$('.next').removeAttr('disabled');
    */
    gadgets.window.adjustHeight();
  },
  // Wrap form submission to request API and confirm travel node selection
  // When done, return to the main calendar view
  saveNewAddress: function(event){
    // this.$('.next').attr('disabled', 'disabled');
    event.preventDefault();
    gadgets.views.requestNavigateTo('home');
    /*
    text_value = this.$('form').find('input[name="address"]').val();
    select_value = this.$('form').find('select[name="address"]').val();
    
    alert(this.getTravelNodeAddress('current_travel_node'));
    alert(this.getTravelNodeTitle('current_travel_node'));
    alert(this.getLatitude('current_travel_node'));
    alert(this.getLongitude('current_travel_node'));
    */
    /*
    if (this.getTravelNodeAddress('previous_travel_node') == 
      this.getTravelNodeAddress('current_travel_node')) {
      alert("You can search travel with same departure and destination.\nI need pretty alert popup design.")
      this.$('.next').removeAttr('disabled');
    } else {
      GoogleRequest.post({
        url: App.config.api_url + "/events/" + this.model.get('_id') + "/travel_nodes_confirmation",
        params: {
          'previous_travel_node[address]': this.getTravelNodeAddress('previous_travel_node'),
          'previous_travel_node[title]': this.getTravelNodeTitle('previous_travel_node'),
          'previous_travel_node[state]': this.getTravelNodeState('previous_travel_node'),
          'previous_travel_node[event_google_id]': this.getEventGoogleId('previous_travel_node'),
          'previous_travel_node[lat]' : this.getLatitude('previous_travel_node'),
          'previous_travel_node[lng]' : this.getLongitude('previous_travel_node'),
          'previous_travel_node[has_normalized]' : this.hasNormalized('previous_travel_node'),
          'current_travel_node[address]': this.getTravelNodeAddress('current_travel_node'),
          'current_travel_node[title]': this.getTravelNodeTitle('current_travel_node'),
          'current_travel_node[state]': this.getTravelNodeState('current_travel_node'),
          'current_travel_node[event_google_id]': this.getEventGoogleId('current_travel_node'),
          'current_travel_node[lat]' : this.getLatitude('current_travel_node'),
          'current_travel_node[lng]' : this.getLongitude('current_travel_node'),
          'current_travel_node[has_normalized]' : this.hasNormalized('current_travel_node'),
          'current_ip' : this.ip
        },
        success: this.waitForTravelNodes
      });
    }
    */
  },  
  // Return the confirmed address for a given travel node
  getTravelNodeAddress: function(travel_node_type) {
    text_value = this.$('form').find('input[name="' + travel_node_type + '\[address\]"]').val();
    select_value = this.$('form').find('select[name="' + travel_node_type + '\[address\]"]').val();
    if (text_value == "") {
      if (select_value){
        return select_value;
      }
      else{
        return '';
      }
    }
    else {
      return text_value;
    }
  },
  // Return the state for a given travel node
  getTravelNodeState: function(travel_node_type) {
    text_value = this.$('form').find('input[name="' + travel_node_type + '\[address\]"]').val();
    select_value = this.$('form').find('select[name="' + travel_node_type + '\[address\]"]').val();
    if (select_value != "") {
      return "confirmed";
    } else {
      return "unconfirmed";
    }
  },
  // Return the address title for a given travel node, used to remember favorite addresses
  getTravelNodeTitle: function(travel_node_type) {
    if (this.$('form').find('input[name="' + travel_node_type + '\[title\]"]').val()){
      return this.$('form').find('input[name="' + travel_node_type + '\[title\]"]').val();
    } else{
      return '';
    }
  },
  getEventGoogleId: function(travel_node_type){
    text_value = this.$('form').find('input[name="' + travel_node_type + '\[address\]"]').val();
    select_value = this.$('form').find('select[name="' + travel_node_type + '\[address\]"]').val();
    if (text_value == "" && select_value) {
      return this.$('form').find('select[name="' + travel_node_type + '\[address\]"] option:selected').data('event-google-id');
    } else {
      return "";
    }
  },
  getLatitude: function(travel_node_type) {
    text_value = this.$('form').find('input[name="' + travel_node_type + '\[address\]"]').val();
    select_value = this.$('form').find('select[name="' + travel_node_type + '\[address\]"]').val();
    if (select_value) {
      return this.$('form').find('select[name="' + travel_node_type + '\[address\]"] option:selected').data('lat');
    } else {
      return "";
    }
  },
  getLongitude: function(travel_node_type) {
    text_value = this.$('form').find('input[name="' + travel_node_type + '\[address\]"]').val();
    select_value = this.$('form').find('select[name="' + travel_node_type + '\[address\]"]').val();
    if (select_value) {
      return this.$('form').find('select[name="' + travel_node_type + '\[address\]"] option:selected').data('lng');
    } else {
      return "";
    }
  },
  hasNormalized: function(travel_node_type) {
    text_value = this.$('form').find('input[name="' + travel_node_type + '\[address\]"]').val();
    select_value = this.$('form').find('select[name="' + travel_node_type + '\[address\]"]').val();
    if (select_value) {
      return this.$('form').find('select[name="' + travel_node_type + '\[address\]"] option:selected').data('has-normalized');
    } else {
      return "";
    }
  },
  // Close travel node selector view and show home view
  close: function(){
    // Cannot pass parameters to home views !?!
    gadgets.views.requestNavigateTo('home');
  },
  // Open google maps window for current selected address
  openGoogleMaps: function(event){
    event.preventDefault();
    window.open("http://google.com/maps?q=" + $(event.currentTarget).closest('.travel_node').find('.selected_address').val(), 'google_maps');
  } 
});

App.Views.TravelNodesSelectorView = Backbone.View.extend({
  events: {
    'click .search_button' : 'search',
    // : 'saveNewAddress',
    'click .google_maps'   : 'openGoogleMaps',
    'click .freq_address'  : 'showFreqAddress'
  },
  initialize: function(){
    // _.bindAll(this, 'waitForTravelNodes');
    this.ab = eval('(' + $.cookie('ab') + ')');
    this.alias = eval('(' + $.cookie('alias') + ')');
    this.render();
    this.showGoogleMap();
  },
  getGeoAutocomplete: function(node) {
    var self = this;
    $('#' + node).geo_autocomplete(new google.maps.Geocoder, {
      mapkey: 'ABQIAAAAbnvDoAoYOSW2iqoXiGTpYBTIx7cuHpcaq3fYV4NM0BaZl8OxDxS9pQpgJkMv0RxjVl6cDGhDNERjaQ', 
  		selectFirst: false,
  		minChars: 3,
  		cacheLength: 50,
  		width: 384,
  		scroll: true,
  		scrollHeight: 300,
  		autoFill: true
  	}).result(function(_event, _data) {
  	  if (_data) {
  	    this.value = _data.formatted_address;
  	    self.map.fitBounds(_data.geometry.viewport);
        // var lng = _data.geometry.location.Ra
        // var lat = _data.geometry.location.Qa                
	    }
	  });
  }, 
  default_layout: _.template('\
    <div class="top"></div>\
    <div class="main">\
      <div class="left"></div>\
      <div class="right"><div class="map_view"></div></div>\
    </div>\
  '),
  top_template: _.template('\
    <div class="logo"></div>\
    <div class="search_box">\
      <div class="search">\
        <input class="keyword" name="q" maxlength="2048" size="28" id="maininput" placeholder="Search Location" />\
      </div>\
      <div class="search_button">\
        <div class="button-outer_block">\
          <div class="search_button_content"></div>\
        </div>\
      </div>\
    </div>\
  '),
  left_template: _.template('\
    <div class="left-top">\
      <div class="google_result">Google Results</div>\
      <div class="freq_address">Frequent Addresses</div>\
    </div>\
    <div class="left-middle"></div>\
    <div class="left-bottom">- (c) 2012 Timejust - </div>\
  '),    
  alias_result: _.template('\
    <div class="result_block">\
      <div class="control_block">\
        <div class="star_symbol on"></div>\
        <div class="title"><%=title%></div>\
      </div>\
      <div class="address_block" data-lat=\"<%=lat%>\" data-lng=\"<%=lng%>\">\
        <div class="marker_<%=index%>"></div>\
        <div id="alias" class="address"><%=address%></div>\
        <div class="city"><%=city%></div>\
      </div>\
    </div>\
  '),
  // render the form for all travel nodes
  render: function(){
    $(this.el).html(this.default_layout);
    var top = $(this.el).find('.top');
    top.html(this.top_template);
    this.getGeoAutocomplete('maininput');    
    
    var left = $(this.el).find('.main').find('.left');
    left.html(this.left_template);
    
    gadgets.window.adjustHeight();
  },
  search: function(e) {
    var keyword = $('#maininput')[0].value;
    if (keyword != "") {
      
    }    
  },
  showGoogleMap: function() {
    var latlng = new google.maps.LatLng(-34.397, 150.644);
    var myOptions = {
      zoom: 4,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var container = $(this.el).find('.main').find('.right').find('.map_view');
    this.map = new google.maps.Map(container[0], myOptions);
  },
  showFreqAddress: function(e) {
    e.preventDefault();
    var self = this;
    var left = $(this.el).find('.left');
    var container = left.find('.left-middle');
    var results = '<div class="results_block">';
    $.each(this.alias, function(i, a) {
      var tok = a.address.split(',');
      var city = "";
      $.each(tok, function(i, c) {
        if (i > 0) {
          city += c;
          if (i < tok.length)
            city += ",";
        }          
      });
      // First token is address, and rest of them are city + country normally.
      results += self.alias_result({
        index: i,
        title: a.title,
        address: tok[0],
        city: city,
        lat: a.lat,
        lng: a.lng
      });
    });
    results += '</div>';
    container.html(results);
  },
  // Wrap form submission to request API and confirm travel node selection
  // When done, return to the main calendar view
  saveNewAddress: function(event) {
    event.preventDefault();
    gadgets.views.requestNavigateTo('home');
    /*
    text_value = this.$('form').find('input[name="address"]').val();
    select_value = this.$('form').find('select[name="address"]').val();   
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

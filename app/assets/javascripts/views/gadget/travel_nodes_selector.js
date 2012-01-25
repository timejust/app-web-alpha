App.Views.TravelNodesSelectorView = Backbone.View.extend({
  events: {
    'click .search_button'  : 'search',
    'click .freq_address'   : 'showFreqAddress',
    'click .google_result'  : 'showGoogleResult',
    'click #google_result.control_block' : 'bookmarkAddress',
    'click #alias_result.star_symbol' : 'bookmarkDelete',
    'click #result.address' : 'selectAddress',
    'click .title'          : 'selectAlias'
  },
  initialize: function(){
    _.bindAll(this, 'onNormalizedAddress');
    this.ab = eval('(' + $.cookie('ab') + ')');
    this.alias = eval('(' + $.cookie('alias') + ')');
    this.original_address = $.cookie('original_address');
    this.ip = $.cookie('ip');
    this.stage = $.cookie('stage');    
    if (this.original_address != '') {
      this.normalizeAddress(this.original_address);
    }
    this.results = new Array();
    this.markerList = new Array();
    this.deletingAliasList = new Array();
    this.render();
    this.bounds = null;
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
  	    // self.map.fitBounds(_data.geometry.viewport);
        // Initialize result array.
        self.results = [];
        var a = {};
        a.address = _data.formatted_address;
        a.location = {};
        a.location.lat = _data.geometry.location.Pa;
        a.location.lng = _data.geometry.location.Qa;        
        self.results.push(a);          
        self.showGoogleResult(null);
	    }
	  });
  }, 
  hitToSearch: function(node) {
    var self = this;
    $('#' + node).keypress(function(e) {
      code = (e.keyCode ? e.keyCode : e.which);
      if (code == 13) {
        self.search(e);
      }
      // e.preventDefault();
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
        <div id="alias_result" class="star_symbol <%=star%>"></div>\
        <div class="title"<% if (star == "off") { %> style="color: gray;font-style: italic;"<%} %>><%=title%></div>\
      </div>\
      <div class="address_block" data-address=\"<%=original_address%>\" data-lat=\"<%=lat%>\" data-lng=\"<%=lng%>\">\
        <div id="alias_marker" class="marker_container">\
          <div class="marker_<%=index%>"></div>\
        </div>\
        <div class="address_container">\
          <div id="alias" class="address"><%=address%></div>\
          <div class="city"><%=city%></div>\
        </div>\
      </div>\
    </div>\
  '),
  google_result: _.template('\
    <div class="result_block">\
      <div class="address_block" data-address=\"<%=original_address%>\" data-lat=\"<%=lat%>\" data-lng=\"<%=lng%>\">\
        <div class="marker_container">\
          <div class="marker_<%=index%>"></div>\
        </div>\
        <div class="address_container">\
          <div id="result" class="address"><%=address%></div>\
          <div class="city"><%=city%></div>\
        </div>\
      </div>\
      <div id="google_result" class="control_block">\
        <div class="star_symbol off"></div>\
        <div class="save_as_alias">Save as alias</div>\
      </div>\
    </div>\
  '),
  // render the form for all travel nodes
  render: function(){
    $(this.el).html(this.default_layout);
    var top = $(this.el).find('.top');
    top.html(this.top_template);
    this.getGeoAutocomplete('maininput');    
    this.hitToSearch('maininput');
    if (this.original_address != "") {
      $(this.el).find('#maininput')[0].value = this.original_address;      
    }        
    var left = $(this.el).find('.main').find('.left');
    left.html(this.left_template);    
    gadgets.window.adjustHeight();
  },
  search: function(e) {
    e.preventDefault();    
    var location = $('#maininput')[0].value;
    if (location != "") {
      this.results = [];
      this.normalizeAddress(location);
    }    
  },
  toRecognizer: function(location, id, ip) {
    return {"geo":encodeURIComponent(location), "id":id, "src":ip}
  },
  normalizeAddress: function(location) {
    var body = new Array();
    var id = 0;   
    if (location != "") {
      body.push(this.toRecognizer(location, id.toString(), this.ip))  
    }
    if (body.length == 0) {
      return;
    }
    GoogleRequest.postWithoutEncoding({
      url: App.config.service_url + "/service-geo/v1/geo/recognition",
      params: JSON.stringify(body),
      success: this.onNormalizedAddress,
      error: function() {        
      }
    }); 
  },
  onNormalizedAddress: function(response) {    
    if (response.data.status == 'ok') {
      var res = response.data.results;      
      for (var i = 0; i < res.length; i++) {
        var t = res[i][i];
        if (t.status == 'ok') {
          for (var k = 0; k < t.results.length; ++k) {
            this.results.push(t.results[k]);          
          }
        }                 
      }      
      this.showGoogleResult(null);
    }    
  },
  saveAlias: function(node) {
    var self = this;
    $('#' + node).keypress(function(e) {
      code = (e.keyCode ? e.keyCode : e.which);
      if (code == 13) {
        var el = $(e.currentTarget);
        var alias = el.parent('div');
        alias.html('<div class="alias" alias="' + el[0].value + '">alias @' + el[0].value + ' added</div>');
      }
    });
  },
  bookmarkAddress: function(e) {
    var star = $(e.currentTarget).find('.star_symbol');
    var tok = star[0].className.split(' ');
    if (tok[1] == 'off') {
      star.toggleClass('on');
      star.toggleClass('off'); 
      var alias = $(e.currentTarget).find('.save_as_alias');
      alias.html('<input id="alias_input" placeholder="Alias name..." />');
      this.saveAlias("alias_input");
    }    
  },
  bookmarkDelete: function(e) {
    var star = $(e.currentTarget);
    var tok = star[0].className.split(' ');
    var title = star.parent('div').find('.title')[0].textContent;
    star.toggleClass('on');
    star.toggleClass('off');           
    if (tok[1] == 'off') {
      star.parent('div').find('.title').attr('style', '');
      var self = this;
      $.each(this.deletingAliasList, function(i, a) {
        if (a != null && a == title) {
          self.deletingAliasList.splice(i, 1);
          return;
        }
      });
    } else {    
      star.parent('div').find('.title').attr('style', 'color: gray;font-style: italic;cursor: text');                     
      // If user tries to delete the given alias, don't delete it right away.
      // Put that in the deleting queue and delete later.
      this.deletingAliasList.push(title);
    }
  },
  showGoogleMap: function() {
    var latlng = new google.maps.LatLng(48.843, 2.275);
    var myOptions = {
      zoom: 8,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var container = $(this.el).find('.main').find('.right').find('.map_view');
    this.map = new google.maps.Map(container[0], myOptions);    
  },
  createPin: function(lat, lng) {
    var marker = new google.maps.Marker({    
      position: new google.maps.LatLng(lat, lng),    
      map: this.map    
    });
    this.markerList.push(marker);
  },
  adjustGoogleMap: function() {
    var kRange = 0.05;
    var self = this;
    self.bounds = null;
    $.each(this.markerList, function(i, marker) {
      var latlng = marker.getPosition();
      var bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(latlng.lat() - kRange, latlng.lng() - kRange), 
        new google.maps.LatLng(latlng.lat() + kRange, latlng.lng() + kRange));
      if (self.bounds == null) {
        self.bounds = bounds;
      } else {
        self.bounds.union(bounds); 
      }  
    });    
    if (self.bounds != null)
      this.map.fitBounds(self.bounds);
  },
  showGoogleResult: function(e) {
    if (e != null)
      e.preventDefault();
    $.each(this.markerList, function(i, marker) {
      marker.setVisible(false);
    });
    this.markerList = [];
        
    var self = this;
    var left = $(this.el).find('.left');
    var container = left.find('.left-middle');
    var results = '<div class="results_block">';
    $.each(this.results, function(i, a) {
      var tok = a.address.split(',');
      var city = "";
      $.each(tok, function(i, c) {
        if (i > 0) {
          city += c;
          if (i + 1 < tok.length)
            city += ",";
        }          
      });
      // First token is address, and rest of them are city + country normally.
      results += self.google_result({
        index: i,
        address: tok[0],
        original_address: a.address,
        city: city,
        lat: a.location.lat,
        lng: a.location.lng
      });     
      self.createPin(a.location.lat, a.location.lng);      
    });    
    results += '</div>';
    container.html(results);    
    self.adjustGoogleMap(); 
  },
  showFreqAddress: function(e) {
    e.preventDefault();
    $.each(this.markerList, function(i, marker) {
      marker.setVisible(false);
    });
    this.markerList = [];
    
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
          if (i + 1 < tok.length)
            city += ",";
        }          
      });
      // Check the deletingQueue, if exists in the list,
      // we delete the alias with empty star symbol
      var inDeleting = false;
      $.each(self.deletingAliasList, function(i, d) {
        if (d != null && d == a.title) {
          inDeleting = true;
          return;
        }
      });      
      // First token is address, and rest of them are city + country normally.
      results += self.alias_result({
        index: i,
        title: a.title,
        address: tok[0],
        original_address: a.address,
        city: city,
        lat: a.lat,
        lng: a.lng,
        star: inDeleting == true ? "off" : "on"
      });
      self.createPin(a.lat, a.lng);      
    });
    results += '</div>';
    container.html(results);
    self.adjustGoogleMap(); 
  },
  selectAlias: function(e) {
    e.preventDefault();
    var el = $(e.currentTarget);
    var address_block = el.parent('div').parent('div').find('.address_block');
    var invalid = false;
    
    $.each(this.deletingAliasList, function(i, d) {
      if (d != null && d == el[0].textContent) {
        invalid = true;
        return;
      }
    });    
    if (invalid == true) {
      return;
    }
    // Delete alias if there are some deleting candidates
    if (this.deletingAliasList.length > 0) {
      $.each(this.deletingAliasList, function(i, d) {
        GoogleRequest.post({
          url: App.config.api_url + "/users/delete_alias",
          params: { 
            'email' : $.cookie('email'),
            'title': d
          },
          success: function() {        
          }
        });
      });            
    }
    // Let's go back to home canvas
    gadgets.views.requestNavigateTo('home');
        
    var ev = {};
    ev.type = 'EVENT_ALIAS_SELECTED';
    ev.params = {};
    ev.params.title = el[0].textContent;
    ev.params.address = address_block.attr('data-address');
    ev.params.lat = address_block.attr('data-lat');
    ev.params.lng = address_block.attr('data-lng');
    ev.params.stage = this.stage;
    ev.params.deleted_alias = this.deletingAliasList;
    var json = JSON.stringify(ev, this.replacer);
    $.cookie('event', json);    
    // Clear deleting alias list
    this.deletingAliasList = [];
  },
  cleanupAliasTitle: function(title) {
    var newTitle = title;
    while (newTitle.indexOf('@') != -1) {
      if (newTitle[0] == '@') {
        newTitle = newTitle.substring(1, newTitle.length);
      } else {
        break;
      }
    }
    return newTitle;
  },
  selectAddress: function(e) {
    e.preventDefault();
    var el = $(e.currentTarget);
    var address_block = el.parent('div').parent('div').parent('div').find('.address_block');
    var control_block = el.parent('div').parent('div').parent('div').find('.control_block');
    var alias = control_block.find('.save_as_alias').find('.alias').attr('alias');
    var self = this;
    
    // If we already have same alias which we added just now, delete previous ones.
    if (alias != null && this.alias.length > 0) {
      $.each(this.alias, function(i, a) {
        if (a.title == '@' + alias) {
          self.deletingAliasList.push(a.title);
        }
      });
    }  
    // Delete alias if exists in deleting list.
    if (this.deletingAliasList.length > 0) {
      $.each(this.deletingAliasList, function(i, d) {
        GoogleRequest.post({
          url: App.config.api_url + "/users/delete_alias",
          params: { 
            'email' : $.cookie('email'),
            'title': d
          },
          success: function() {        
          }
        });
      });
    }        
    // Add aliases if exists
    if (alias != 0) {
      // If there is an alias with the address, we save it
      GoogleRequest.post({
        url: App.config.api_url + "/users/add_alias",
        params: { 
          'email' : $.cookie('email'),
          'address': address_block.attr('data-address'),
          'title': '@' + this.cleanupAliasTitle(alias),
          'lat': address_block.attr('data-lat'),
          'lng': address_block.attr('data-lng')
        },
        success: function() {        
        }
      });
    }    
    
    // Let's go back to home canvas
    gadgets.views.requestNavigateTo('home');
        
    var ev = {};
    ev.type = 'EVENT_ADDRESS_SELECTED';
    ev.params = {};
    if (alias.length > 0) {
      ev.params.title = '@' + this.cleanupAliasTitle(alias);
    }    
    ev.params.address = address_block.attr('data-address');
    ev.params.lat = address_block.attr('data-lat');
    ev.params.lng = address_block.attr('data-lng');
    ev.params.stage = this.stage;
    ev.params.deleted_alias = this.deletingAliasList;
    var json = JSON.stringify(ev, this.replacer);
    $.cookie('event', json); 
    // Clear deleting alias list
    this.deletingAliasList = [];    
  },    
  replacer: function(key, value) {
    if (typeof value === 'number' && !isFinite(value)) {
        return String(value);
    }
    return value;
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
  }
});

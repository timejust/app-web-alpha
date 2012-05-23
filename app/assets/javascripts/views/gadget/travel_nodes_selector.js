App.Views.TravelNodesSelectorView = Backbone.View.extend({
  events: {
    'click .search_button'                      : 'search',
    'click #add_alias'                          : 'addAlias',
    'click #google_result.control_block'        : 'bookmarkAddress',
    'click #alias_result.alias_delete'          : 'bookmarkDelete',
    'click #use_google_result'                  : 'selectAddress',
    'click #result.address'                     : 'focusMapWithResult',    
    'click #use_alias_result'                   : 'selectAlias',
    'click .title'                              : 'focusMapWithAlias',
    'click #alias_marker.marker_container'      : 'focusMapWithAliasMarker',
    'click #google_marker_container.marker_container' : 'focusMapWithResultMarker',
  },
  initialize: function(){
    _.bindAll(this, 'onNormalizedAddress');
    _.bindAll(this, 'handleTabChanged');
    this.results = new Array();
    this.markerList = new Array();
    this.seed = this.options.seed;        
    this.ab = eval('(' + $.cookie(this.seed + '_ab') + ')');
    this.alias = eval('(' + $.cookie(this.seed + '_alias') + ')');
    this.email = $.cookie(this.seed + '_email');
    timejust.setCookie(this.seed + '_ab', null);
    timejust.setCookie(this.seed + '_alias', null);
    this.viewPortWidth = 0;
    this.viewPortHeight = 0;
    this.bounds = null;        
    this.kResultContainer = "google_result_container";
    this.kAliasContainer = "alias_result_container";
    this.eventKey = this.options.eventKey;
    this.ip = this.options.ip;
    this.stage = this.options.stage;
    this.original_address = this.options.original_address;
    var doNormalize = true;
    // If the given address is alias, get location information from
    // alias list and set it to result list.
    if (alias.isAlias(this.original_address)) {
      var a = alias.getAddressFromAlias(this.alias, this.original_address);
      if (a != null) {
        this.original_address = a.address;
        this.results.push({address: a.address,
          location: { lat: a.lat, lng: a.lng } });  
        doNormalize = false;  
      }      
    } 
    this.setResizeEventHandler();    
    this.render();                  
    this.showAliasResult(null, true); 
    if (doNormalize) {
      if (this.original_address != null && this.original_address != '') {
        this.normalizeAddress(this.original_address);
        this.selectTab(0);
      } else {
        this.selectTab(1);        
      }  
    } else {
      this.showGoogleResult(null, true);
      this.selectTab(0);
    }    
  },
  selectTab: function(tab) {
    var panel0 = $("#left-middle").find('.nav').find('.nav-one').find('a');
    var panel1 = $("#left-middle").find('.nav').find('.nav-two').find('a');
    if (tab == 0) {
      $("#left-middle").showTab(panel0[0], {
        "speed":10, "delegate":this.handleTabChanged});
    } else {
      $("#left-middle").showTab(panel1[0], {
        "speed":10, "delegate":this.handleTabChanged});
    }
  },
  getCurrentStage: function() {
    return this.current_stage;
  },
  setResizeEventHandler: function() {
    var self = this;
    $(window).bind('resize', function () { 
      self.resize();
    });
  },
  getViewPorts: function() {
    // the more standards compliant browsers (mozilla/netscape/opera/IE7) use 
    // window.innerWidth and window.innerHeight
    if (typeof window.innerWidth != 'undefined') {
      this.viewPortWidth = window.innerWidth;
      this.viewPortHeight = window.innerHeight;
    } else if (typeof document.documentElement != 'undefined'
              && typeof document.documentElement.clientWidth !=
              'undefined' && document.documentElement.clientWidth != 0) {
      // IE6 in standards compliant mode (i.e. with a valid doctype as 
      // the first line in the document)              
      this.viewPortWidth = document.documentElement.clientWidth;
      this.viewPortHeight = document.documentElement.clientHeight;
    } else {
      // older versions of IE
      this.viewPortWidth = document.getElementsByTagName('body')[0].clientWidth;
      this.viewPortHeight = document.getElementsByTagName('body')[0].clientHeight;
    }
  },
  getGeoAutocomplete: function(node) {
    var self = this;
    var autocomplete = new google.maps.places.Autocomplete($('#' + node)[0]);
    autocomplete.setTypes([]);
    // autocomplete.bindTo('bounds', this.map);
    
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
      var place = autocomplete.getPlace();
      // Initialize result array.
      self.results = [];
      if (place != null && place.geometry != null && place.geometry.location != null) {
        var a = {};
        a.address = place.formatted_address;
        a.location = {
          'lat': place.geometry.location.lat(),
          'lng': place.geometry.location.lng()
        };
        self.results.push(a);             
        self.selectTab(0);    
        self.showGoogleResult(null, true);
      } else {
        self.search(null);
      }
    });    
  }, 
  hitToSearch: function(node) {
    var self = this;
    $('#' + node).keypress(function(e) {
      code = (e.keyCode ? e.keyCode : e.which);
      if (code == 13) {
        var pac = $('#travelNodesSelector').parent('body').find('.pac-container');
        if (pac == null || pac.length == 0 || pac[0].style.display == 'none') 
          self.search(e);
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
    <div class="logo"></div>\
  '),
  left_template: _.template('\
    <div class="left-middle" id="left-middle">\
      <ul class="nav">\
        <li class="nav-one"><a id="nav-one" href="#google_result_container" class="current">Search Results</a></li>\
        <li class="nav-two last"><a id="nav-two" href="#alias_result_container">Frequent Addresses</a></li>\
      </ul>\
      <div class="list-wrap">\
        <ul id="google_result_container" class="google_result_container"></ul>\
        <ul id="alias_result_container" class="alias_result_container hide"></ul>\
      </div>\
    </div>\
    <div class="left-bottom">- (c) 2012 Timejust - </div>\
  '),    
  alias_result: _.template('\
    <div class="result_block">\
      <div class="control_block">\
        <div id="alias_result" class="alias_delete" />\
        <div class="title"<% if (star == "off") { %> style="color: gray;font-style: italic;"<%} %>><%=title%></div>\
        <div class="accessory_container">\
          <div id="use_alias_result" class="accessory_button base_button accessory">Go!</div>\
          <% if (accessLevel == "owner") { %><div class="accessory_button base_button accessory">C</div><% } %>\
        </div>\
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
        <div class="accessory_container">\
          <div id="use_google_result" class="accessory_button base_button accessory">Go!</div>\
          <% if (accessLevel == "owner") { %><div class="accessory_button base_button accessory">C</div><% } %>\
        </div>\
        <div id="google_marker_container" class="marker_container">\
          <div class="marker_<%=index%>"></div>\
        </div>\
        <div class="address_container">\
          <div id="result" class="address"><%=address%></div>\
          <div class="city"><%=city%></div>\
        </div>\
      </div>\
      <div id="google_result" class="control_block">\
        <div class="alias_symbol off"></div>\
        <div class="save_as_alias">Click to save as alias</div>\
        <img class="loader" src="<%=asset_server%>/assets/loader.gif" style="display: none;margin-top: 10px;" />\
      </div>\
    </div>\
  '),
  resize: function() {
    this.getViewPorts();
    var top = $(this.el).find('.top');
    var left = $(this.el).find('.main').find('.left');    
    var map_height = this.viewPortHeight - top.height() - 1;
    var map_width = this.viewPortWidth - left.width() - 1;
    var style = "height: " + map_height + "px; width: " + map_width + "px;"
    var right = $(this.el).find('.right');
    right.attr("style", style);    
    gadgets.window.adjustHeight();
  },
  handleTabChanged: function(e, id) {
    this.current_stage = id;
    if (id == this.kResultContainer) {
      this.showGoogleResult(null, false);
    } else if (id == this.kAliasContainer) {
      this.showAliasResult(null, false);
    }  
  },
  // render the form for all travel nodes
  render: function(){
    $(this.el).html(this.default_layout);
    var top = $(this.el).find('.top');
    top.html(this.top_template);
    this.getGeoAutocomplete('maininput');        
    // this.hitToSearch('maininput');
    if (this.original_address != "") {
      $(this.el).find('#maininput')[0].value = this.original_address;      
    }        
    var left = $(this.el).find('.main').find('.left');    
    left.html(this.left_template);    
    $("#left-middle").organicTabs({
      "speed":10, "delegate":this.handleTabChanged
    });    
    this.resize();
    this.showGoogleMap();
  },
  search: function(e) {
    if (e != null)
      e.preventDefault();        
    var location = $('#maininput')[0].value;
    if (location != "") {
      this.results = [];
      this.selectTab(0);
      this.normalizeAddress(location);
      // this.showAliasResult(null);
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
      url: App.config.service_url + "/v1/geo/recognition",
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
      this.showGoogleResult(null, true);
    }    
  },
  handleAliasDeleted: function(title) {
    if (this.alias != null) {   
      var a = null;
      for (var i = 0; i < this.alias.length; ++i) {
        a = this.alias[i];
        if (this.cleanupAliasTitle(a.title) == title) {
          this.alias.splice(i, 1);
          break;
        }
      }        
    }                        
    var ev = {
      type: 'EVENT_ALIAS_DELETED',
      params: {
        title: '@' + title,
        stage: self.stage
      }
    };               
    EventLoop.sendEvent(ev, this.eventKey);
    
    // Refresh alias result view
    this.showAliasResult(null, true);    
  },
  handleAliasAdded: function(el, loader, o) {
    if (this.alias != null & o != null) {   
      var replaced = false;
      var a = null;
      for (var i = 0; i < this.alias.length; ++i) {
        a = this.alias[i];
        if (a.title == o.title) {
          this.alias.splice(i, 1, o);
          replaced = true;
          break;
        }
      }                            
      if (replaced != true)
        this.alias.push(o);
    }                        
    var ev = {
      type: 'EVENT_ALIAS_ADDED',
      params: {
        title: o.title,
        address: o.address,
        lat: o.lat,
        lng: o.lng,
        stage: self.stage
      }
    };                   
    EventLoop.sendEvent(ev, this.eventKey);
    
    // Display alias add completion message.    
    var title = this.cleanupAliasTitle(o.title);
    el.html('<div class="alias" alias="' + title + '">alias @' + title + ' added</div>');
    loader[0].style.display = "none";
    
    // Refresh alias result view
    this.showAliasResult(null, true);    
  },
  addAlias: function(e) {
    var el = $("#alias_input");
    var alias = el.parent('div');
    var ab = el.parent('div').parent('div').parent('div').find('.address_block');        
    var loader = el.parent('div').parent('div').find('.loader');
    var title = this.cleanupAliasTitle(el[0].value);
    var o = { 
      address: ab.attr('data-address'),
      lat: ab.attr('data-lat'),
      lng: ab.attr('data-lng'),
      title: '@' + title
    };        
    // Once we get 'hit' key, disable input box first.
    el.attr('disabled', true);
    loader[0].style.display = "inline-block"

    var self = this;
    
    // Add the given alias to server system
    GoogleRequest.post({
      url: App.config.api_url + "/users/add_alias",
      params: { 
        'email' : self.email,
        'address': o.address,
        'title': o.title,
        'lat': o.lat,
        'lng': o.lng
      },
      error: function() {
        // If we get an error, reverse back input box to normal mode and 
        // disappear loading gif
        el.attr('disabled', false);
        loader[0].style.display = "none"
      },
      success: function() {                    
        self.handleAliasAdded(alias, loader, o);            
      }          
    });
  },
  saveAlias: function(node) {
    var self = this;
    $('#' + node).focus();
    $('#' + node).keypress(function(e) {
      code = (e.keyCode ? e.keyCode : e.which);
      if (code == 13) {
        self.addAlias(e);  
      }
    });
  },
  bookmarkAddress: function(e) {
    var star = $(e.currentTarget).find('.alias_symbol');
    var tok = star[0].className.split(' ');
    if (tok[1] == 'off') {
      star.toggleClass('on');
      star.toggleClass('off'); 
      var alias = $(e.currentTarget).find('.save_as_alias');
      alias.html('<input id="alias_input" placeholder="Alias name..." style="height: 25px;"/>\
<div id="add_alias" class="accessory_button base_button accessory" style="display: inline-block; margin-left: 10px; vertical-align: 0px; height: 25px;">Add</div>');  
      this.saveAlias("alias_input");      
    }          
  },
  deleteAlias: function(title) {
    var title = this.cleanupAliasTitle(title);
    var self = this;
    // Add the given alias to server system
    GoogleRequest.post({
      url: App.config.api_url + "/users/delete_alias",
      params: { 
        'email' : self.email,
        'title': '@' + title
      },
      error: function() {
      },
      success: function() {    
        self.handleAliasDeleted(title);                
      }
    });
  },
  bookmarkDelete: function(e) {
    var title = $(e.currentTarget).parent('div').find('.title')[0].textContent;
    this.deleteAlias(title);
  },
  showGoogleMap: function() {
    var latlng = new google.maps.LatLng(48.843, 2.275);
    var myOptions = {
      zoom: 13,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var container = $(this.el).find('.main').find('.right').find('.map_view');
    this.map = new google.maps.Map(container[0], myOptions);    
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
    if (self.bounds != null) {
      this.map.fitBounds(self.bounds);
    }
  },  
  createPin: function(lat, lng, index) {
    if (index == null || index > 10) {
      index = 10;
    }
    var marker = new google.maps.Marker({    
      position: new google.maps.LatLng(lat, lng),    
      map: this.map,      
      icon: new google.maps.MarkerImage(
        App.config.web_url + "/icons/pins/" + index + ".png",
        new google.maps.Size(20, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(0, 34)
        ),
      shadow: new google.maps.MarkerImage(
        App.config.web_url + "/icons/pins/shadow.png",
        new google.maps.Size(37, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(0, 34)
        ),    
    });
    this.markerList.push(marker);
  },
  deletePins: function() {
    $.each(this.markerList, function(i, marker) {
      marker.setVisible(false);
    });
    this.markerList = [];      
  },
  tokenizeAddress: function(address) {
    var tok = address.split(',');
    var city = "";
    $.each(tok, function(i, c) {
      if (i > 0) {
        city += c;
        if (i + 1 < tok.length)
          city += ",";
      }          
    });
    return [tok[0], city];
  },
  getHeadLineText: function() {
    var text = "";
    if (this.stage == "previous") {
      text = "You are leaving from";
    } else if (this.stage == "next") {
      text = "You are going to";
    } else {
      text = "Your appointment is at";
    }
    return text;
  },
  showGoogleResult: function(e, reload) {
    if (e != null)
      e.preventDefault();        
    var self = this;
    var left = $(this.el).find('.left');
    var container = left.find('.left-middle').find('.google_result_container');
    var results = '<div class="results_block">';
    var kMaxPins = 10;    
    if (this.results != null) {
      self.deletePins();      
      results += '<div class="headline">' + self.getHeadLineText() + '</div>';
      $.each(this.results, function(i, a) {
        if (reload == true) {
          var tok = self.tokenizeAddress(a.address);
          var generalPin = (kMaxPins < i ? true : false);
          // First token is address, and rest of them are city + country normally.
          results += self.google_result({
            accessLevel: self.accessLevel,
            index: generalPin ? 10 : i,
            address: tok[0],
            original_address: a.address,
            city: tok[1],
            lat: a.location.lat,
            lng: a.location.lng,
            asset_server: App.config.web_url
          });     
        }
        self.createPin(a.location.lat, a.location.lng, i);      
      });  
    }            
    // We only reload when the given reload param is true.
    if (reload == true) {
      results += '</div>';
      container.html(results);  
    }        
    // if (this.getCurrentStage() == this.kResultContainer)
    self.adjustGoogleMap();   
  },
  showAliasResult: function(e, reload) {
    if (e != null)
      e.preventDefault();    
    var self = this;
    var left = $(this.el).find('.left');
    var container = left.find('.left-middle').find('.alias_result_container');
    var results = '<div class="results_block">';
    var kMaxPins = 10;    
    if (this.alias != null) {
      self.deletePins();     
      results += '<div class="headline">' + self.getHeadLineText() + '</div>';
      $.each(this.alias, function(i, a) {
        if (reload == true) {
          var tok = self.tokenizeAddress(a.address);
          var generalPin = (kMaxPins < i ? true : false);
         // First token is address, and rest of them are city + country normally.
          results += self.alias_result({
            accessLevel: self.accessLevel,
            index: generalPin ? 10 : i,
            title: a.title,
            address: tok[0],
            original_address: a.address,
            city: tok[1],
            lat: a.lat,
            lng: a.lng,
            star: "on"
          });
        }        
        self.createPin(a.lat, a.lng, i);      
      });
    }
    if (reload == true) {
      results += '</div>';
      container.html(results);
    }    
    if (this.getCurrentStage() == this.kAliasContainer)
      self.adjustGoogleMap();
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
  selectAlias: function(e) {
    e.preventDefault();
    var title = $(e.currentTarget).parent('div').parent('div').find('.title');

    // Let's go back to home canvas
    gadgets.views.requestNavigateTo('home');      
    var ev = {
      type: 'EVENT_ALIAS_SELECTED',
      params: {
        title: title[0].textContent,
        stage: this.stage
      }
    };
    EventLoop.sendEvent(ev, this.eventKey);
  },
  selectAddress: function(e) {
    e.preventDefault();
    var el = $(e.currentTarget);
    var address_block = el.parent('div').parent('div').parent('div').find('.address_block');
    var control_block = el.parent('div').parent('div').parent('div').find('.control_block');
    var alias = control_block.find('.save_as_alias').find('.alias').attr('alias');

    // Let's go back to home canvas
    gadgets.views.requestNavigateTo('home');
        
    var ev = {
      type: 'EVENT_ADDRESS_SELECTED',
      params: {
        address: address_block.attr('data-address'),
        lat: address_block.attr('data-lat'),
        lng: address_block.attr('data-lng'),
        stage: this.stage
      }
    };
    if (alias != null) {
      ev.params.title = '@' + this.cleanupAliasTitle(alias);
    }    
    EventLoop.sendEvent(ev, this.eventKey);
  },    
  focusMapWithAlias: function(e) {
    var title = $(e.currentTarget)[0].textContent;
    var latlng = null;
    $.each(this.alias, function(i, a) {
      if (a.title == title) {
        latlng = new google.maps.LatLng(a.lat, a.lng);
        return false;
      }
    });
    if (latlng != null) {
      this.map.setCenter(latlng);
      this.map.setZoom(17);  
    }    
  },
  focusMapWithAliasMarker: function(e) {
    var el = $(e.currentTarget).parent('div').parent('div').find('.title');    
    var title = el[0].textContent;
    var latlng = null;
    $.each(this.alias, function(i, a) {
      if (a.title == title) {
        latlng = new google.maps.LatLng(a.lat, a.lng);
        return false;
      }
    });
    if (latlng != null) {
      this.map.setCenter(latlng);
      this.map.setZoom(17);  
    }    
  },
  focusMapWithResult: function(e) {
    var ab = $(e.currentTarget).parent('div').parent('div');
    var address = ab.attr("data-address");
    var latlng = null;
    $.each(this.results, function(i, a) {
      if (a.address == address) {
        latlng = new google.maps.LatLng(a.location.lat, a.location.lng);
        return false;
      }
    });
    if (latlng != null) {
      this.map.setCenter(latlng);
      this.map.setZoom(17);
    }
  },
  focusMapWithResultMarker: function(e) {
    var ab = $(e.currentTarget).parent('div');
    var address = ab.attr("data-address");
    var latlng = null;
    $.each(this.results, function(i, a) {
      if (a.address == address) {
        latlng = new google.maps.LatLng(a.location.lat, a.location.lng);
        return false;
      }
    });
    if (latlng != null) {
      this.map.setCenter(latlng);
      this.map.setZoom(17);
    }
  },
  // Close travel node selector view and show home view
  close: function(){
    // Cannot pass parameters to home views !?!
    gadgets.views.requestNavigateTo('home');
  }
});

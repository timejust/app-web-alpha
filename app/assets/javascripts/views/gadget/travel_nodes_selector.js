App.Views.TravelNodesSelectorView = Backbone.View.extend({
  events: {
    'click .search_button'  : 'search',
    'click .freq_address'   : 'freqAddressClickHandler',
    'click .google_result'  : 'googleResultClickHandler',
    'click #google_result.control_block' : 'bookmarkAddress',
    'click #alias_result.alias_delete' : 'bookmarkDelete',
    'click #result.address' : 'selectAddress',
    'click .title'          : 'selectAlias'
  },
  initialize: function(){
    _.bindAll(this, 'onNormalizedAddress');
    this.results = new Array();
    this.markerList = new Array();    
    this.ab = eval('(' + $.cookie('ab') + ')');
    this.alias = eval('(' + $.cookie('alias') + ')');
    this.original_address = $.cookie('original_address');
    this.ip = $.cookie('ip');
    this.stage = $.cookie('stage');  
    timejust.setCookie('ab', null);
    timejust.setCookie('alias', null);
    timejust.setCookie('original_address', null);
    timejust.setCookie('ip', null);
    timejust.setCookie('stage', null);    
    this.showAliasResult = false;    
    this.viewPortWidth = 0;
    this.viewPortHeight = 0;
    this.bounds = null;    
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
    this.showFreqAddress(null); 
    if (doNormalize) {
      if (this.original_address != null && this.original_address != '') {
        this.normalizeAddress(this.original_address);
      } else {
        this.showAliasResult = true;        
      }  
    } else {
      this.showGoogleResult(null, true);
    }    
  },
  freqAddressClickHandler: function() {
    this.showAliasResult = true;
    // Switch current left panel to alias result container        
    this.showFreqAddress(null);
    this.hideGoogleResult();
  },
  googleResultClickHandler: function() {
    this.showAliasResult = false;
    // Switch current left panel to google result container
    this.showGoogleResult(null);
    this.hideAliasResult();
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
        a.location = {};
        var location = place.geometry.location;
        a.location.lat = (location.Ua != null ? location.Ua : location.Sa);        
        a.location.lng = (location.Va != null ? location.Va : location.Ta);              
        self.results.push(a);             
        self.showAliasResult = false;     
        self.showGoogleResult(null, true);
        self.showFreqAddress(null);                        
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
      <div class="google_result">Search Results</div>\
      <div class="freq_address">Frequent Addresses</div>\
    </div>\
    <div class="left-middle">\
      <div class="alias_result_container"></div>\
      <div class="google_result_container"></div>\
    </div>\
    <div class="left-bottom">- (c) 2012 Timejust - </div>\
  '),    
  alias_result: _.template('\
    <div class="result_block">\
      <div class="control_block">\
        <div id="alias_result" class="alias_delete" />\
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
        <div class="alias_symbol off"></div>\
        <div class="save_as_alias">Click to save as alias</div>\
        <img class="loader" src="<%=asset_server%>/assets/loader.gif" style="display: none;margin-top: 5px;" />\
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
    this.resize();
    this.showGoogleMap();
  },
  search: function(e) {
    if (e != null)
      e.preventDefault();        
    var location = $('#maininput')[0].value;
    if (location != "") {
      this.results = [];
      this.showAliasResult = false;
      this.normalizeAddress(location);
      this.showFreqAddress(null);
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
  saveAlias: function(node) {
    var self = this;
    $('#' + node).focus();
    $('#' + node).keypress(function(e) {
      code = (e.keyCode ? e.keyCode : e.which);
      if (code == 13) {
        var el = $(e.currentTarget);
        var alias = el.parent('div');
        var ab = el.parent('div').parent('div').parent('div').find('.address_block');        
        var loader = el.parent('div').parent('div').find('.loader');
        var title = self.cleanupAliasTitle(el[0].value);
        var o = { 
          address: ab.attr('data-address'),
          lat: ab.attr('data-lat'),
          lng: ab.attr('data-lng'),
          title: '@' + title
        };        
        // Once we get 'hit' key, disable input box first.
        el.attr('disabled', true);
        loader[0].style.display = "inline-block"
        
        // Add the given alias to server system
        GoogleRequest.post({
          url: App.config.api_url + "/users/add_alias",
          params: { 
            'email' : $.cookie('email'),
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
            if (self.alias != null & o != null) {   
              var replaced = false;
              var a = null;
              for (var i = 0; i < self.alias.length; ++i) {
                a = self.alias[i];
                if (a.title == o.title) {
                  self.alias.splice(i, 1, o);
                  replaced = true;
                  break;
                }
              }                            
              if (replaced != true)
                self.alias.push(o);
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
            var json = JSON.stringify(ev, self.replacer);
            timejust.setCookie('event', json);
            
            alias.html('<div class="alias" alias="' + title + '">alias @' + title + ' added</div>');
            loader[0].style.display = "none"
          }
        });     
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
      alias.html('<input id="alias_input" placeholder="Alias name..." />');  
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
        'email' : $.cookie('email'),
        'title': '@' + title
      },
      error: function() {
      },
      success: function() {                    
        if (self.alias != null) {   
          var a = null;
          for (var i = 0; i < self.alias.length; ++i) {
            a = self.alias[i];
            if (self.cleanupAliasTitle(a.title) == title) {
              self.alias.splice(i, 1);
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
        var json = JSON.stringify(ev, self.replacer);
        timejust.setCookie('event', json);            
        
        self.showFreqAddress(null);
      }
    });
  },
  bookmarkDelete: function(e) {
    // var star = $(e.currentTarget);
    // var tok = star[0].className.split(' ');
    var title = $(e.currentTarget).parent('div').find('.title')[0].textContent;
    // star.toggleClass('on');
    // star.toggleClass('off');           

    // if (tok[1] != 'off') {
    this.deleteAlias(title);
    // }   
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
  hideGoogleResult: function() {
    var left = $(this.el).find('.left');
    var container = left.find('.left-middle').find('.google_result_container');
    container[0].style.display = "none";
  },
  hideAliasResult: function() {
    var left = $(this.el).find('.left');
    var container = left.find('.left-middle').find('.alias_result_container');
    container[0].style.display = "none";
  },
  showGoogleResult: function(e, reload) {
    if (e != null)
      e.preventDefault();        
    var self = this;
    var left = $(this.el).find('.left');
    var container = left.find('.left-middle').find('.google_result_container');
    var results = '<div class="results_block">';
    var kMaxPins = 10;    
    if (this.showAliasResult == false && this.results != null) {
      $.each(this.markerList, function(i, marker) {
        marker.setVisible(false);
      });
      this.markerList = [];      
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
        var generalPin = (kMaxPins < i ? true : false);
        // First token is address, and rest of them are city + country normally.
        results += self.google_result({
          index: generalPin ? 10 : i,
          address: tok[0],
          original_address: a.address,
          city: city,
          lat: a.location.lat,
          lng: a.location.lng,
          asset_server: App.config.web_url
        });     
        self.createPin(a.location.lat, a.location.lng, i);      
      });  
    }    
    results += '</div>';
    
    // We only reload when the given reload param is true.
    if (reload == true) {
      container.html(results);  
    }
      
    if (this.showAliasResult == false) {
      self.adjustGoogleMap(); 
      container[0].style.display = 'block';  
    } else {
      container[0].style.display = 'none';    
    }
  },
  showFreqAddress: function(e) {
    if (e != null)
      e.preventDefault();    
    var self = this;
    var left = $(this.el).find('.left');
    var container = left.find('.left-middle').find('.alias_result_container');
    var results = '<div class="results_block">';
    var kMaxPins = 10;    
    if (this.showAliasResult == true && this.alias != null) {
      $.each(this.markerList, function(i, marker) {
        marker.setVisible(false);
      });
      this.markerList = [];      
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
        var generalPin = (kMaxPins < i ? true : false);
       // First token is address, and rest of them are city + country normally.
        results += self.alias_result({
          index: generalPin ? 10 : i,
          title: a.title,
          address: tok[0],
          original_address: a.address,
          city: city,
          lat: a.lat,
          lng: a.lng,
          // star: inDeleting == true ? "off" : "on"
          star: "on"
        });
        self.createPin(a.lat, a.lng, i);      
      });
    }
    results += '</div>';
    container.html(results);
    if (this.showAliasResult == true) {
      self.adjustGoogleMap(); 
      container[0].style.display = 'block';  
    } else {
      container[0].style.display = 'none';  
    }
  },
  selectAlias: function(e) {
    e.preventDefault();
    var el = $(e.currentTarget);
    var address_block = el.parent('div').parent('div').find('.address_block');

    // Let's go back to home canvas
    gadgets.views.requestNavigateTo('home');
        
    var ev = {
      type: 'EVENT_ALIAS_SELECTED',
      params: {
        title: el[0].textContent,
        // address: address_block.attr('data-address'),
        // lat: address_block.attr('data-lat'),
        // lng: address_block.attr('data-lng'),
        stage: this.stage
      }
    };
    var json = JSON.stringify(ev, this.replacer);
    timejust.setCookie('event', json);
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

    // Let's go back to home canvas
    gadgets.views.requestNavigateTo('home');
        
    var ev = {};
    ev.type = 'EVENT_ADDRESS_SELECTED';
    ev.params = {};
    if (alias != null) {
      ev.params.title = '@' + this.cleanupAliasTitle(alias);
    }    
    ev.params.address = address_block.attr('data-address');
    ev.params.lat = address_block.attr('data-lat');
    ev.params.lng = address_block.attr('data-lng');
    ev.params.stage = this.stage;
    var json = JSON.stringify(ev, this.replacer);
    timejust.setCookie('event', json);
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
      else {
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

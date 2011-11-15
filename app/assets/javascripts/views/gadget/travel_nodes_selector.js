App.Views.TravelNodesSelectorView = Backbone.View.extend({
  events: {
    'submit form'                   : 'submitTravelNodes',
    'click .search'                 : 'searchForAddress',
    'click .cancel'                 : 'cancel',
    'click .google_maps'            : 'openGoogleMaps',
    'blur .other_address input'     : 'changeSearchState',
    'keyup .other_address input'    : 'changeSearchState',
    'keydown .other_address input'  : 'getGeoAutocomplete'
  },
  initialize: function(){
    this.model = new App.Models.Event({_id: this.options.apiEventId});
    _.bindAll(this, 'waitForTravelNodes');
    this.waitForTravelNodes();
  },
  // Start polling API for travel nodes proposals
  // when API ready, display the confirmation form
  waitForTravelNodes: function(){
    showLoader();
    var self = this;
    $.poll(function(retry){
      GoogleRequest.get({
        url: App.config.api_url + "/events/" + self.model.get('_id') + "/travel_nodes?nocache=" + new Date().getTime(),
        // TODO specs
        success: function(response){
          // travels_nodes are processed and require confirmation
          self.model = new App.Models.Event(response.data);
          self.render();
        },
        // TODO specs
        error: function(response){
          // travels_nodes are in process
          if (response.rc == 404) {
            retry();
          }
          // travels_nodes are processed and not require confirmation, go to travels proposals views
          else if (response.rc == 410) {
            self.close();
          }
        }
      });
    });
  },
  // global template for form
  form_template: _.template("\
    <form action=\"#\">\
      <%= inputs %>\
      <p><a href=\"#\" class=\"cancel\">Cancel</a><input type=\"submit\" value=\"Next\" class=\"next\"/></p>\
    </form>\
  "),
  // Template for each travel node confirmation
  input_template: _.template("\
    <div class=\"travel_node\">\
    <h2><%= label_type %>:</h2>\
    <% if (options != '') { %>\
      <p>\
        <select name=\"<%= type %>[address]\" class=\"selected_address\"><%= options %></select>\
        <input type=\"button\" value=\"Maps\" class=\"google_maps\"/>\
        <span class=\"favorite\">Add it to favorite: <input type=\"text\" name=\"<%= type %>[title]\" placeholder=\"alias\"/></span>\
      </p>\
    <% } %>\
    <p class=\"other_address\">Or enter: <input type=\"text\" width=\"300px\" id=\"location\" name=\"<%= type %>[address]\" placeholder=\"address\"/><input type=\"submit\" value=\"Replace\" class=\"search\" data-target=\"<%= type %>\"/></p>\
    </div>\
  "),
  // Template for option elements
  option_template: _.template("<option value=\"<%= value %>\" <%= selected %> data-event-google-id=\"<%= event_id %>\"><%= label %></option>"),
  // Return the form inputs for a given travel node
  formInputsFor: function(travel_nodes_type, name){
    var self = this;
    var options = "";
    var inputs = "";
    if(this.model.get(travel_nodes_type + 's')) {
      var selected_address = this.model.get(travel_nodes_type);
      $.each(this.model.get(travel_nodes_type + 's'), function(i,e){
        options += self.option_template( {
          value: e.address,
          label: (e.title ? e.title + ' - ' + e.address : e.address),
          selected: (selected_address && selected_address.address == e.address ? 'selected' : ''),
          event_id: e.event_google_id
        });
      });
    }
    inputs += this.input_template( { label_type: this.travel_nodes_type_label(travel_nodes_type), type: travel_nodes_type, options: options } );
    return inputs;
  },
  travel_nodes_type_label: function(travel_nodes_type){
    if (travel_nodes_type == 'current_travel_node'){
      return "To (" + $.truncate(this.model.get('title'), 70) + ")";
    }
    else if (travel_nodes_type == 'previous_travel_node'){
      return "From";
    }
    else if (travel_nodes_type == 'next_travel_node'){
      return "Then";
    }
  },
  // render the form for all travel nodes
  render: function(){
    $(this.el).html(this.form_template({
      inputs: this.formInputsFor('previous_travel_node') + this.formInputsFor('current_travel_node') + this.formInputsFor('next_travel_node')
    }));
    hideLoader();
    this.disableAllSearchSubmit();
    this.$('.next').removeAttr('disabled');
    gadgets.window.adjustHeight();
  },
  // Wrap form submission to request API and confirm travel node selection
  // When done, return to the main calendar view
  submitTravelNodes: function(event){
    this.$('.next').attr('disabled', 'disabled');
    event.preventDefault();
    GoogleRequest.post({
      url: App.config.api_url + "/events/" + this.model.get('_id') + "/travel_nodes_confirmation",
      params: {
        'previous_travel_node[address]': this.getTravelNodeAddress('previous_travel_node'),
        'previous_travel_node[title]': this.getTravelNodeTitle('previous_travel_node'),
        'previous_travel_node[state]': this.getTravelNodeState('previous_travel_node'),
        'previous_travel_node[event_google_id]': this.getEventGoogleId('previous_travel_node'),
        'current_travel_node[address]': this.getTravelNodeAddress('current_travel_node'),
        'current_travel_node[title]': this.getTravelNodeTitle('current_travel_node'),
        'current_travel_node[state]': this.getTravelNodeState('current_travel_node'),
        'current_travel_node[event_google_id]': this.getEventGoogleId('current_travel_node'),
        'next_travel_node[address]': this.getTravelNodeAddress('next_travel_node'),
        'next_travel_node[title]': this.getTravelNodeTitle('next_travel_node'),
        'next_travel_node[state]': this.getTravelNodeState('next_travel_node'),
        'next_travel_node[event_google_id]': this.getEventGoogleId('next_travel_node')
      },
      success: this.waitForTravelNodes
    });
  },
  // Cancel an event travel proposal (also used to stop polling API for Travels)
  cancel: function(event){
    event.preventDefault();
    GoogleRequest.put({
      url: App.config.api_url + "/events/" + this.model.get('_id') + "/cancel",
      success: this.close
    });
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
  getGeoAutocomplete: function(e) {
    if ($(e.currentTarget).val().length > 1) {
      $(e.currentTarget).geo_autocomplete(new google.maps.Geocoder, {
    		mapkey: 'ABQIAAAAbnvDoAoYOSW2iqoXiGTpYBTIx7cuHpcaq3fYV4NM0BaZl8OxDxS9pQpgJkMv0RxjVl6cDGhDNERjaQ', 
    		selectFirst: false,
    		minChars: 3,
    		cacheLength: 50,
    		width: 300,
    		scroll: true,
    		scrollHeight: 300,
    		autoFill: true
    	}).result(function(_event, _data) {
    	  if (_data) {
    	    e.currentTarget.value = _data.formatted_address;
    	    $(e.currentTarget).parent('.other_address').find('.search').attr('disabled', 'disabled');    	    
    	    var select = $(e.currentTarget).parent('.other_address').parent('.travel_node').find('.selected_address');
    	    select = $(this).parent('.other_address').parent('.travel_node').find('.selected_address');      
          selected = -1;
          for (i = 0; i < select[0].length; i++) {
            if (select[0].options[i].value == _data.formatted_address) {
              selected = i;
              break;
            } 
          }
          if (selected == -1) {
            a = "<option value=\"" + _data.formatted_address + "\" data-event-google-id=\"\">" + _data.formatted_address + "</option>" + select.html();      
    	      select.html(a)
    	      selected = 0
          } 
    	    select[0].selectedIndex = selected
  	    }
  	  });
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
  },
  // TODO spec
  searchForAddress: function(e){
    var text_value = this.$('form').find('input[name="' + $(e.currentTarget).data('target') + '\[address\]"]').val();
    if(text_value == "") {
      e.preventDefault();
    }
  },
  // TODO spec
  changeSearchState: function(e){
    if($(e.currentTarget).val() == ""){
      $(e.currentTarget).parent('.other_address').find('.search').attr('disabled', 'disabled');
    }
    else {
      $(e.currentTarget).parent('.other_address').find('.search').removeAttr('disabled');
    }
  },
  // TODO spec
  disableAllSearchSubmit: function(){
    this.$('.search').attr('disabled', 'disabled');
  }
});

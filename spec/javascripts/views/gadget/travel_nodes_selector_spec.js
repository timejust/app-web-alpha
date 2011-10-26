describe("TravelNodesSelector", function(){

  beforeEach(function(){
    // A basic js event object
    this.js_event = { preventDefault: function(){} };

    // TODO use Factory
    this.apiEventJSON = {
      title: "My event",
      previous_travel_nodes: [
        {
          address: "previous address, Paris"
        }
      ],
      current_travel_nodes: [
        {
          address: "current address, Paris"
        }
      ],
      next_travel_nodes: [
        {
          address: "next address, Paris"
        }
      ],
      travels: [
        {
          'provider': 'ratp',
          'estimated_time': 42
        },
        {
          'provider': 'google-directions',
          'estimated_time': 42
        },
        {
          'provider': 'fake_provider'
        }
      ]
    }
    this.apiEventId = "42";

    $("#jasmine_container").html('<div id="travelNodesSelector"></div>')
    this.view = new App.Views.TravelNodesSelectorView({
      el: $('#travelNodesSelector').get(0),
      apiEventId: this.apiEventId
    })
  });

  describe("initialize", function(){

    it("should initialize a new Event with id: apiEventId", function(){
      expect(this.view.model.get('_id')).toBe(this.apiEventId)
    });

    it("should call waitForTravelNodes", function(){
      var spy = sinon.spy(this.view, 'waitForTravelNodes');
      this.view.initialize();
      expect(spy).toHaveBeenCalledOnce();
    });

  });

  describe("waitForTravelNodes", function(){
    beforeEach(function(){
      this.window_spy = sinon.spy(window, 'showLoader');
    });

    afterEach(function(){
      expect(this.window_spy).toHaveBeenCalledOnce();
      this.window_spy.restore();
    });

    it("should poll API for travels nodes", function(){
      this.clock = sinon.useFakeTimers();
      var poll_spy = sinon.spy($, 'poll');
      var api_spy = sinon.spy(GoogleRequest, 'get');

      this.view.waitForTravelNodes();
      this.clock.tick(1000);

      expect(poll_spy).toHaveBeenCalledOnce();
      expect(api_spy).toHaveBeenCalledOnce();
      expect(api_spy.getCall(0).args[0].url).toBe(App.config.api_url + "/events/" + this.view.model.get('_id') + "/travel_nodes?nocache=" + new Date().getTime())
      // TODO assert callbacks

      poll_spy.restore();
      api_spy.restore();
      this.clock.restore();
    });

  });

  describe("render and FormInputsFor", function(){
    beforeEach(function(){
      this.view.model = new App.Models.Event(this.apiEventJSON);
      this.template_spy = sinon.spy(this.view, 'form_template');
    });

    afterEach(function(){
      this.template_spy.restore();
    });

    it("render form with travel_nodes proposals", function(){
      this.view.render();
      var form = $(this.view.el).find('form');

      var previous_options = []
      $.each(
        $(form).find('select[name="previous_travel_node\[address\]"] option'),
        function(i, e){
          previous_options.push($(e).attr('value'));
        }
      );
      $.each(
        this.view.model.get('previous_travel_nodes'),
        function(i, e){
          expect(previous_options).toContain(e.address);
        }
      );
      var current_options = []
      $.each(
        $(form).find('select[name="current_travel_node\[address\]"] option'),
        function(i, e){
          current_options.push($(e).attr('value'));
        }
      );
      $.each(
        this.view.model.get('current_travel_nodes'),
        function(i, e){
          expect(current_options).toContain(e.address);
        }
      );
      var next_options = []
      $.each(
        $(form).find('select[name="next_travel_node\[address\]"] option'),
        function(i, e){
          next_options.push($(e).attr('value'));
        }
      );
      $.each(
        this.view.model.get('next_travel_nodes'),
        function(i, e){
          expect(next_options).toContain(e.address);
        }
      );

      var labels = $(form).find('h2');
      expect($(labels[0])).toHaveText("From:");
      expect($(labels[1])).toHaveText("To (" + this.view.model.get('title') + '):');
      expect($(labels[2])).toHaveText("Then:");

      expect($(form)).toContain('input[name="previous_travel_node\[address\]"]')
      expect($(form)).toContain('input[name="current_travel_node\[address\]"]')
      expect($(form)).toContain('input[name="next_travel_node\[address\]"]')

      expect($(form)).toContain('input[name="previous_travel_node\[title\]"]')
      expect($(form)).toContain('input[name="current_travel_node\[title\]"]')
      expect($(form)).toContain('input[name="next_travel_node\[title\]"]')
    });

  });

  describe("getTravelNodesAddress", function(){
    beforeEach(function(){
      this.view.model = new App.Models.Event(this.apiEventJSON);
      this.view.render();
    });

    it("selecting from select input if text input empty", function(){
      expect(this.view.getTravelNodeAddress('previous_travel_node')).toBe(
        this.view.model.get('previous_travel_nodes')[0].address
      );
      expect(this.view.getTravelNodeAddress('current_travel_node')).toBe(
        this.view.model.get('current_travel_nodes')[0].address
      );
      expect(this.view.getTravelNodeAddress('next_travel_node')).toBe(
        this.view.model.get('next_travel_nodes')[0].address
      );
    });

    it("selecting from text input if not empty", function(){
      var form = $(this.view.el).find('form');
      $(form).find('input[name="previous_travel_node\[address\]"]').val('previous');
      $(form).find('input[name="current_travel_node\[address\]"]').val('current');
      $(form).find('input[name="next_travel_node\[address\]"]').val('next');
      expect(this.view.getTravelNodeAddress('previous_travel_node')).toBe("previous");
      expect(this.view.getTravelNodeAddress('current_travel_node')).toBe('current');
      expect(this.view.getTravelNodeAddress('next_travel_node')).toBe('next');
    });

  });

  describe("getTravelNodesTitle", function(){
    beforeEach(function(){
      this.view.model = new App.Models.Event(this.apiEventJSON);
      this.view.render();
    });

    it("selecting from text input if not empty", function(){
      var form = $(this.view.el).find('form');
      $(form).find('input[name="previous_travel_node\[title\]"]').val('previous');
      $(form).find('input[name="current_travel_node\[title\]"]').val('current');
      $(form).find('input[name="next_travel_node\[title\]"]').val('next');
      expect(this.view.getTravelNodeTitle('previous_travel_node')).toBe("previous");
      expect(this.view.getTravelNodeTitle('current_travel_node')).toBe('current');
      expect(this.view.getTravelNodeTitle('next_travel_node')).toBe('next');
    });

  });

  describe("getTravelNodesState", function(){
    beforeEach(function(){
      this.view.model = new App.Models.Event(this.apiEventJSON);
      this.view.render();
    });

    it("unconfirmed if value came from input text", function(){
      var form = $(this.view.el).find('form');
      $(form).find('input[name="previous_travel_node\[address\]"]').val('');
      $(form).find('input[name="current_travel_node\[address\]"]').val('');
      $(form).find('input[name="next_travel_node\[address\]"]').val('');
      expect(this.view.getTravelNodeState('previous_travel_node')).toBe("confirmed");
      expect(this.view.getTravelNodeState('current_travel_node')).toBe('confirmed');
      expect(this.view.getTravelNodeState('next_travel_node')).toBe('confirmed');
      $(form).find('input[name="previous_travel_node\[address\]"]').val('previous');
      $(form).find('input[name="current_travel_node\[address\]"]').val('current');
      $(form).find('input[name="next_travel_node\[address\]"]').val('next');
      expect(this.view.getTravelNodeState('previous_travel_node')).toBe("unconfirmed");
      expect(this.view.getTravelNodeState('current_travel_node')).toBe('unconfirmed');
      expect(this.view.getTravelNodeState('next_travel_node')).toBe('unconfirmed');
    });

    it("unconfirmed if there is no text value and no select", function(){
      var form = $(this.view.el).find('form');
      $(form).find('input[name="previous_travel_node\[address\]"]').val('');
      $(form).find('input[name="current_travel_node\[address\]"]').val('');
      $(form).find('input[name="next_travel_node\[address\]"]').val('');

      $(form).find('select[name="previous_travel_node\[address\]"]').remove();
      $(form).find('select[name="current_travel_node\[address\]"]').remove();
      $(form).find('select[name="next_travel_node\[address\]"]').remove();

      expect(this.view.getTravelNodeState('previous_travel_node')).toBe("unconfirmed");
      expect(this.view.getTravelNodeState('current_travel_node')).toBe('unconfirmed');
      expect(this.view.getTravelNodeState('next_travel_node')).toBe('unconfirmed');
    });


  });

  describe("cancel", function(){

    beforeEach(function(){
      this.view.model = new App.Models.Event(this.apiEventJSON);
    });

    it("should send request to API to change event status", function(){
      var api_spy = sinon.spy(GoogleRequest, 'put');

      this.view.cancel(this.js_event);

      expect(api_spy).toHaveBeenCalledOnce();
      expect(api_spy).toHaveBeenCalledWith({
        url: App.config.api_url + "/events/" + this.view.model.get('_id') + "/cancel",
        success: this.view.close
      });
      api_spy.restore();
    });

  });

  describe("SubmitTravelNodes", function(){

    beforeEach(function(){
      this.view.model = new App.Models.Event(this.apiEventJSON);
    });

    it("should request API to send travel nodes confirmation", function(){
      var api_spy = sinon.spy(GoogleRequest, 'post');

      this.view.submitTravelNodes(this.js_event);

      expect(api_spy).toHaveBeenCalledOnce();
      expect(api_spy).toHaveBeenCalledWith({
        url: App.config.api_url + "/events/" + this.view.model.get('_id') + "/travel_nodes_confirmation",
        params: {
          'previous_travel_node[address]': this.view.getTravelNodeAddress('previous_travel_node'),
          'previous_travel_node[title]': this.view.getTravelNodeTitle('previous_travel_node'),
          'previous_travel_node[state]': this.view.getTravelNodeState('previous_travel_node'),
          'previous_travel_node[event_google_id]': this.view.getEventGoogleId('previous_travel_node'),
          'current_travel_node[address]': this.view.getTravelNodeAddress('current_travel_node'),
          'current_travel_node[title]': this.view.getTravelNodeTitle('current_travel_node'),
          'current_travel_node[state]': this.view.getTravelNodeState('current_travel_node'),
          'current_travel_node[event_google_id]': this.view.getEventGoogleId('current_travel_node'),
          'next_travel_node[address]': this.view.getTravelNodeAddress('next_travel_node'),
          'next_travel_node[title]': this.view.getTravelNodeTitle('next_travel_node'),
          'next_travel_node[state]': this.view.getTravelNodeState('next_travel_node'),
          'next_travel_node[event_google_id]': this.view.getEventGoogleId('next_travel_node'),
        },
        success: this.view.waitForTravelNodes
      });
      api_spy.restore();
    });

  });

  describe("openGoogleMaps", function(){

    it("should open a new window on google maps for the selected address", function(){
      var spy = sinon.spy(window, 'open');
      this.view.model = new App.Models.Event(this.apiEventJSON);
      this.view.render();
      previous = $(this.view.el).find('select[name="previous_travel_node\[address\]"]').val();
      current = $(this.view.el).find('select[name="current_travel_node\[address\]"]').val();
      next = $(this.view.el).find('select[name="next_travel_node\[address\]"]').val();
      $(this.view.el).find('.google_maps').click();
      expect(spy).toHaveBeenCalledThrice();
      expect(spy).toHaveBeenCalledWith("http://google.com/maps?q=" + previous, "google_maps");
      expect(spy).toHaveBeenCalledWith("http://google.com/maps?q=" + current, "google_maps");
      expect(spy).toHaveBeenCalledWith("http://google.com/maps?q=" + next, "google_maps");
    });
  });

});

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


  });

  describe("waitForTravelNodes", function(){
    beforeEach(function(){
      this.window_spy = sinon.spy(window, 'showLoader');
    });

    afterEach(function(){
      expect(this.window_spy).toHaveBeenCalledOnce();
      this.window_spy.restore();
    });

  });

  describe("render and FormInputsFor", function(){
    beforeEach(function(){
      this.view.model = new App.Models.Event(this.apiEventJSON);
      this.template_spy = sinon.spy(this.view, 'default_layout');
    });

    afterEach(function(){
      this.template_spy.restore();
    });
/*
    it("render form with travel_nodes proposals", function(){
      this.view.render();      
    });
*/
  });

  describe("getTravelNodesAddress", function(){
    beforeEach(function(){
      this.view.model = new App.Models.Event(this.apiEventJSON);
      this.view.render();
    });
      /*
    it("selecting from select input if text input empty", function(){
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
      */
  });

  describe("getTravelNodesTitle", function(){
    beforeEach(function(){
      this.view.model = new App.Models.Event(this.apiEventJSON);
      this.view.render();
    });
      /*
    it("selecting from text input if not empty", function(){
      var form = $(this.view.el).find('form');
      $(form).find('input[name="previous_travel_node\[title\]"]').val('previous');
      $(form).find('input[name="current_travel_node\[title\]"]').val('current');
      $(form).find('input[name="next_travel_node\[title\]"]').val('next');
      expect(this.view.getTravelNodeTitle('previous_travel_node')).toBe("previous");
      expect(this.view.getTravelNodeTitle('current_travel_node')).toBe('current');
      expect(this.view.getTravelNodeTitle('next_travel_node')).toBe('next');
    });
          */

  });

  describe("getTravelNodesState", function(){
    beforeEach(function(){
      this.view.model = new App.Models.Event(this.apiEventJSON);
      this.view.render();
    });
/*
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
    */
    /*
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
      */

  });
});

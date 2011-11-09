describe("TravelsView", function(){

  beforeEach(function(){
    $('#jasmine_content').append('<div id="travels"></div>');
    // TODO use Factory
    this.apiEventJSON = {
      _id: '42',
      previous_travel_node: {
        address: "15 rue poisonnières, Paris"
      },
      current_travel_node: {
        address: "15 rue poisonnières, Paris"
      },
      next_travel_node: {
        address: "15 rue poisonnières, Paris"
      },
      travels: [
        {
          transports: ['car'],
          calendar: "BlackProposal",
          travel_steps: [
            {
              '_id': 19,
              'provider': 'google-directions',
              'estimated_time': 42,
              'departure_time': new Date(),
              'arrival_time': new Date(),
              'estimated_time': 9,
              'distance': 42,
              'travel_type': 'backward',
              'calendar': 'BlackProposal'
            }
          ]
        },
        {
          transports: ['metro', 'tram'],
          calendar: "BlackProposal",
          travel_steps: [
            {
              '_id': 18,
              'provider': 'ratp',
              'estimated_time': 42,
              'departure_time': new Date(),
              'arrival_time': new Date(),
              'estimated_time': 9,
              'steps': ['step1', 'step2'],
              'travel_type': 'backward',
              'calendar': 'BlackProposal'
            }
          ]
        },
        {
          transports: [],
          calendar: "BlackProposal",
          travel_steps: [
            {
              'provider': 'fake_provider'
            }
          ]
        },
      ]
    }
    this.apiEventId = 42;
    this.view = new App.Views.TravelsView({ el: $("#travels").get(0), apiEventId: this.apiEventId});
  });

  describe("initialize", function(){

    beforeEach(function(){
      this.window_spy = sinon.spy(window, 'showLoader');
    });

    afterEach(function(){
      expect(this.window_spy).toHaveBeenCalledOnce();
      this.window_spy.restore();
    });

    it("should assign this.apiEventId from params", function(){
      this.view.initialize();
      expect(this.view.apiEventId).toBe(this.apiEventId);
    })

    it("should poll travels from API", function(){
      this.clock = sinon.useFakeTimers();
      var poll_spy = sinon.spy($, 'poll');
      var api_spy = sinon.spy(GoogleRequest, 'get');

      this.view.initialize();
      this.clock.tick(1000);

      expect(poll_spy).toHaveBeenCalledOnce();
      expect(api_spy).toHaveBeenCalledOnce();
      expect(api_spy.getCall(0).args[0].url).toBe(App.config.api_url + "/events/" + this.apiEventId + "/travels?nocache=" + new Date().getTime());
      // TODO : assert callbacks

      poll_spy.restore();
      api_spy.restore();
      this.clock.restore();
    });

  });

  describe("handleTravelResponse", function(){

    describe("event canceled (410)", function(){

      it("should hideLoader", function(){
        var spy = sinon.spy(window, 'hideLoader');
        var response = {rc: 410};
        this.view.handleTravelResponse(response);
        expect(spy).toHaveBeenCalledOnce();
        spy.restore();
      });

      it("should set this.model to null", function(){
        var response = {rc: 410};
        this.view.handleTravelResponse(response);
        expect(this.view.model).toBe(null);
      });

    });

    describe("event processed (200)", function(){

      beforeEach(function(){
        this.render_stub = sinon.stub(this.view, 'render');
        this.window_spy = sinon.spy(window, 'hideLoader');
      });

      afterEach(function(){
        expect(this.window_spy).toHaveBeenCalledOnce();
        this.window_spy.restore();
        expect(this.render_stub).toHaveBeenCalledOnce();
        this.render_stub.restore();
      });

      it("should set this.model to new Event(response.data) and call render", function(){
        var response = {rc: 200, data: this.apiEventJSON};
        var spy = sinon.spy(App.Models.Event.prototype, 'initialize');
        this.view.handleTravelResponse(response);
        expect(spy).toHaveBeenCalledWith(response.data);
        spy.restore();
        expect(this.view.model.id).toBe(this.apiEventJSON['_id']);
      });

    });

    describe("render", function(){

      beforeEach(function(){
        this.calendar_mock = sinon.mock(google.calendar);
        this.calendar_mock.expects('refreshEvents').once();
        this.gadgets_mock = sinon.mock(gadgets.window);
        this.gadgets_mock.expects('adjustHeight').once();
      });

      afterEach(function(){
        this.calendar_mock.verify();
        this.calendar_mock.restore();
        this.gadgets_mock.verify();
        this.gadgets_mock.restore();
      });

      it("should render each travels", function(){
        var spy = sinon.spy();
        var travel_view = sinon.stub(App.Views.TravelView.prototype, 'initialize');

        this.view.model = new App.Models.Event(this.apiEventJSON);
        this.view.render();

        expect($(this.view.el).find('.previous_travel_node')).toContain('.travel_node_toggle.off');
        expect($(this.view.el).find('.previous_travel_node .travel_node_expand .address')).toHaveText(
          this.view.model.get('previous_travel_node')['address']
        );
        expect($(this.view.el).find('.previous_travel_node .travel_node_expand .address')).toHaveText(
          this.view.model.get('previous_travel_node')['address']
        );
        expect($(this.view.el).find('.current_travel_node')).toContain('.travel_node_toggle.off');
        expect($(this.view.el).find('.current_travel_node .travel_node_expand .address')).toHaveText(
          this.view.model.get('current_travel_node')['address']
        );
        expect($(this.view.el).find('.next_travel_node')).toContain('.travel_node_toggle.off');
        expect($(this.view.el).find('.next_travel_node .travel_node_expand .address')).toHaveText(
          this.view.model.get('next_travel_node')['address']
        );

        expect(travel_view).toHaveBeenCalledThrice();
        // TODO : assert called to render
      });

    });

  });

});

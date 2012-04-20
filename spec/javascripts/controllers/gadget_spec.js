describe("GadgetController", function(){

  beforeEach(function(){
    this.controller = new App.Controllers.GadgetController();
  });

  describe("sidebar", function(){

    it("should initialize a user", function(){
      var user = new User();
      var spy = sinon.stub(User.prototype, 'initialize');
      spy.returns(user);
      this.controller.sidebar();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    })

    it("should bind user 'status:loaded' on initSidebarViews", function(){
      var spy = sinon.spy(this.controller, 'initSidebarViews');
      this.controller.sidebar();
      this.controller.user.trigger('status:loaded');
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

  });

  describe("initSidebarViews", function(){

    beforeEach(function(){
      this.user = new User();
      this.controller.user = this.user;
    });

    it("should add notification if user is not registered", function(){
      $('#jasmine_content').html('<div id="notifications"></div>');
      this.controller.user.state = "not_registered";
      this.controller.initSidebarViews();
      expect($("#notifications")).toHaveHtml("<p>You must register on <a href='" + App.config.web_url + "' target='blank'>Timejust website</a></p>");
    });

    it("should add notification if user have not authorized Timejust", function(){
      $('#jasmine_content').html('<div id="notifications"></div>');
      this.controller.user.state = "unauthorized";
      this.controller.initSidebarViews();
      expect($("#notifications")).toHaveHtml("<p>You must authorize Timejust to access your calendar by clicking : <a href='" + App.config.web_url + "/oauth2/authorize?return_to=http://google.com/calendar' target='blank'>here</a></p>");
    });

    it("should init EventView and purge events if user is registered and have no pendingEvent", function(){
      this.controller.user.state = 'registered';
      this.controller.user.pendingEvent = false;
      this.controller.ip = "192.168.0.1";
      var user_spy = sinon.stub(this.controller.user, 'purgeTravels');
      var spy = sinon.stub(App.Views.EventView.prototype, 'initialize');
      this.controller.initSidebarViews();
      expect(user_spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith({ el: $('#selectedEvent').get(0), ip: this.controller.ip, user: this.controller.user });
      spy.restore();
      user_spy.restore();
    });

    /* Desactivated see #94, #51
    it("should init EventView if user is registered and have pendingEvent", function(){
      this.controller.user.registered = true;
      this.controller.user.pendingEvent = {_id: 42, foo: 'bar'};
      var event_spy = sinon.stub(App.Views.EventView.prototype, 'initialize');
      var travels_spy = sinon.stub(App.Views.TravelsView.prototype, 'initialize');
      this.controller.initSidebarViews();
      expect(event_spy).toHaveBeenCalledWith({ el: $('#selectedEvent').get(0), user: this.controller.user });
      expect(travels_spy).toHaveBeenCalledWith({ el: $('#travels').get(0), apiEventId: 42 });
      event_spy.restore();
      travels_spy.restore();
    });
    */

  });

  describe("travel_node_selector", function(){

    it("should initialize TravelNodesSelectorView", function(){
      var gadgets_params = sinon.stub(window.gadgets.views, 'getParams');
      var ip = "192.168.0.1";
      var eventKey = "key";
      var seed = "xxxx";
      var stage = "current";
      var address = "26 rue de longchamp";
      gadgets_params.returns({
        ip: ip,
        eventKey: eventKey,
        seed: seed,
        stage: stage,
        original_address: address
        });
      var spy = sinon.stub(App.Views.TravelNodesSelectorView.prototype, 'initialize');
      this.controller.travel_node_selector();
      expect(spy).toHaveBeenCalledWith({
        el: $('#travelNodesSelector').get(0),
        ip: ip,
        eventKey: eventKey,
        seed: seed,
        stage: stage,
        original_address: address
      });
      spy.restore();
      gadgets_params.restore();
    });

  });

});

describe("User", function(){
  beforeEach(function(){
    this.model = new User();
  });

  describe("initialize", function(){

    it("should initialize attributes", function(){
      expect(this.model.email).toBeUndefined();
      expect(this.model.preferences).toBeUndefined();
      expect(this.model.state).toBe('waiting');
      expect(this.model.pendingEvent).toBeUndefined();
    });

    it("should bind 'preferences:loaded' on loadPendingEvents", function(){
      var spy = sinon.spy(this.model, 'bind');
      this.model.initialize();
      expect(spy).toHaveBeenCalledWith('preferences:loaded', this.model.loadPendingEvents);
      spy.restore();
    });

    it("should call this.loadPreferences", function(){
      var spy = sinon.spy(this.model, 'loadPreferences');
      this.model.initialize();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });
  });

  describe("loadPreferences", function(){

    it("should call google.calendar.getPreferences", function() {
      var spy = sinon.spy(google.calendar, 'getPreferences');
      this.model.loadPreferences();
      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(this.model.preferencesCallback);
      spy.restore();
    });

  });

  describe("preferencesCallback", function(){

    it("should assign email and attributes from response", function(){
      this.model.preferencesCallback({viewer: 'test@example.com'});
      expect(this.model.email).toEqual('test@example.com');
      expect(this.model.preferences).toEqual({viewer: 'test@example.com'});
    });

    it("should trigger 'preferences:loaded' event", function(){
      var spy = sinon.spy();
      this.model.bind('preferences:loaded', spy);
      this.model.preferencesCallback({viewer: 'test@example.com'});
      expect(spy).toHaveBeenCalledOnce();
      this.model.unbind('preferences:loaded', spy);
    });

  });

  describe("loadPendingEvents", function(){

    it("should request API and call setStatus", function(){
      this.clock = sinon.useFakeTimers();
      var spy = sinon.spy(GoogleRequest, 'get');
      this.model.email = 'test@example.com';
      this.model.loadPendingEvents();
      expect(spy).toHaveBeenCalledWith({
        url: App.config.api_url + "/users/status?email=" + this.model.email + "&nocache=" + new Date().getTime(),
        success: this.model.setStatus
      });
      spy.restore();
      this.clock.restore();
    });

  });

  describe("setStatus", function(){

    it("should set state to not_registred if response is a 404", function(){
      expect(this.model.state).toBe('waiting');
      this.model.setStatus({rc: 404});
      expect(this.model.state).toBe('not_registered');
    });

    it("should set state to registered if response is not a 404", function(){
      expect(this.model.state).toBe('waiting');
      this.model.setStatus({rc: 204});
      expect(this.model.state).toBe('registered');
      this.model.setStatus({rc: 200});
      expect(this.model.state).toBe('registered');
    });

    it("should set state to unauthorized if response is not a 401", function(){
      expect(this.model.state).toBe('waiting');
      this.model.setStatus({rc: 401});
      expect(this.model.state).toBe('unauthorized');
    });

    it("should set pendingEvent from response.data if response is a 200", function(){
      var event_from_api = {foo: 'bar'};
      this.model.setStatus({rc: 200, data: event_from_api});
      expect(this.model.pendingEvent).toBe(event_from_api);
    });

  });

  it("should request API on purgeTravels", function(){
    var spy = sinon.stub(GoogleRequest, 'put');
    this.model.purgeTravels();
    expect(spy).toHaveBeenCalledOnce();
    spy.restore();
  });

});

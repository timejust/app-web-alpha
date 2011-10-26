describe("App.Models.TravelStep", function(){
  beforeEach(function(){
    App.config.api_url = 'http://example.com'
  });

  it("should have url", function(){
    var travel_step = new App.Models.TravelStep();
    expect(travel_step.url()).toBe("http://example.com/travel_steps");
    travel_step.set({'_id': '42'});
    expect(travel_step.url()).toBe("http://example.com/travel_steps/42");
  });

  it("should have attributes", function(){
    var travel_step = new App.Models.TravelStep({
      _id: 42,
      foo: 'bar'
    });
    expect(travel_step.get('_id')).toBe(42);
    expect(travel_step.get('foo')).toBe('bar');
  });

  describe("use GoogleRequest to sync", function(){

    it("should fetch", function(){
      var spy = sinon.stub(GoogleRequest, 'get');
      var travel_step = new App.Models.TravelStep({_id: '42'});
      travel_step.fetch();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

    it("should create", function(){
      var spy = sinon.stub(GoogleRequest, 'post');
      var travel_step = new App.Models.TravelStep();
      travel_step.save();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

    it("should update", function(){
      var spy = sinon.stub(GoogleRequest, 'put');
      var travel_step = new App.Models.TravelStep({_id: '42'});
      travel_step.set({foo: 'bar'});
      travel_step.save();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

    it("should destroy", function(){
      var spy = sinon.stub(GoogleRequest, 'destroy');
      var travel_step = new App.Models.TravelStep({_id: '42'});
      travel_step.destroy();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

    it("should confirm", function(){
      var spy = sinon.stub(GoogleRequest, 'put');
      var travel_step = new App.Models.TravelStep({_id: '42'});
      travel_step.confirm();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

    it("should bookmark", function(){
      var spy = sinon.stub(GoogleRequest, 'put');
      var travel_step = new App.Models.TravelStep({_id: '42'});
      travel_step.bookmark();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

  });

});

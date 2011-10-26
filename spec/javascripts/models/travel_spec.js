describe("App.Models.Travel", function(){
  beforeEach(function(){
    App.config.api_url = 'http://example.com'
  });

  it("should have url", function(){
    var travel = new App.Models.Travel();
    expect(travel.url()).toBe("http://example.com/travels");
    travel.set({'_id': '42'});
    expect(travel.url()).toBe("http://example.com/travels/42");
  });

  it("should have attributes", function(){
    var travel = new App.Models.Travel({
      _id: 42,
      foo: 'bar'
    });
    expect(travel.get('_id')).toBe(42);
    expect(travel.get('foo')).toBe('bar');
  });

  describe("use GoogleRequest to sync", function(){

    it("should fetch", function(){
      var spy = sinon.stub(GoogleRequest, 'get');
      var travel = new App.Models.Travel({_id: '42'});
      travel.fetch();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

    it("should create", function(){
      var spy = sinon.stub(GoogleRequest, 'post');
      var travel = new App.Models.Travel();
      travel.save();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

    it("should update", function(){
      var spy = sinon.stub(GoogleRequest, 'put');
      var travel = new App.Models.Travel({_id: '42'});
      travel.set({foo: 'bar'});
      travel.save();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

    it("should destroy", function(){
      var spy = sinon.stub(GoogleRequest, 'destroy');
      var travel = new App.Models.Travel({_id: '42'});
      travel.destroy();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

    it("should confirm", function(){
      var spy = sinon.stub(GoogleRequest, 'put');
      var travel = new App.Models.Travel({_id: '42'});
      travel.confirm();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

    it("should bookmark", function(){
      var spy = sinon.stub(GoogleRequest, 'put');
      var travel = new App.Models.Travel({_id: '42'});
      travel.bookmark();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

  });

  it("should return locomotion", function(){
    var travel = new App.Models.Travel({provider: 'ratp'});
    expect(travel.locomotion()).toBe('public transportation');
    var travel = new App.Models.Travel({provider: 'google-directions'});
    expect(travel.locomotion()).toBe('car travel');
  });

});

describe("App.Models.Event", function(){
  beforeEach(function(){
    App.config.api_url = 'http://example.com'
  });

  it("should have url", function(){
    var event = new App.Models.Event();
    expect(event.url()).toBe("http://example.com/events");
    event.id = '42';
    expect(event.url()).toBe("http://example.com/events/42");
  });

  it("should have attributes", function(){
    var event = new App.Models.Event({
      _id: 42,
      foo: 'bar'
    });
    expect(event.get('_id')).toBe(42);
    expect(event.get('foo')).toBe('bar');
  });

  describe("use GoogleRequest to sync", function(){

    it("should fetch", function(){
      var spy = sinon.stub(GoogleRequest, 'get');
      var event = new App.Models.Event({_id: '42'});
      event.fetch();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

    it("should create", function(){
      var spy = sinon.stub(GoogleRequest, 'post');
      var event = new App.Models.Event();
      event.save();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

    it("should update", function(){
      var spy = sinon.stub(GoogleRequest, 'put');
      var event = new App.Models.Event({_id: '42'});
      event.set({foo: 'bar'});
      event.save();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

    it("should destroy", function(){
      var spy = sinon.stub(GoogleRequest, 'destroy');
      var event = new App.Models.Event({_id: '42'});
      event.destroy();
      expect(spy).toHaveBeenCalledOnce();
      spy.restore();
    });

  });

});

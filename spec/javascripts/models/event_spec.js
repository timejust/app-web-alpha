describe("App.Models.Event", function(){
  beforeEach(function(){
    App.config.api_url = 'http://example.com'
    this.calendarId = "minsik.kim@groupe-stone.fr"
    this.calendarUrl = App.config.api_url + "/calendar/" + this.calendarId;
    this.eId = "bWpocjhmbGQyOTE5YmIzMzcwMDc4amJnaDggbWluc2lrLmtpbUBncm91cGUtc3RvbmUuZnI"
  });

  it("should have url", function(){
    var event = new App.Models.Event({calendarId: this.calendarId});
    expect(event.urlWithEid()).toBe(this.calendarUrl + "/events/eid/");
    expect(event.url()).toBe(this.calendarUrl + "/events/");
    event.eId = this.eId;
    expect(event.urlWithEid()).toBe(this.calendarUrl + "/events/eid/" + this.eId);
    event._id = 42;
    expect(event.url()).toBe(this.calendarUrl + "/events/42");
  });

  it("should have attributes", function(){
    var event = new App.Models.Event({
      _id: 42,
      foo: 'bar'
    });
    expect(event.get('_id')).toBe(42);
    expect(event.get('foo')).toBe('bar');
  });

  describe("event fetching with eid", function() {
    it ("should fetch with eid", function() {
      var spy = sinon.stub(GoogleRequest, 'get');
      
      var event = new App.Models.Event({eId: this.eId, 
                                        calendarId: this.calendarId})
      event.fetchWithEid();
      expect(spy).toHaveBeenCalledOnce();
      expect(event.eId).toEqual(this.eId)
      spy.restore();  
    });    
  });
  /*
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
  */

});

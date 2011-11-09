describe("$.poll", function(){

  beforeEach(function(){
    this.clock = sinon.useFakeTimers();
  });

  afterEach(function(){
    this.clock.restore();
  });

  it("should poll each 1000 by default", function(){
    var foo = function(retry){ retry(); }
    var spy = sinon.spy(foo);
    $.poll(spy);
    this.clock.tick(500);
    expect(spy).not.toHaveBeenCalled();
    this.clock.tick(1000);
    expect(spy).toHaveBeenCalledOnce();
    this.clock.tick(2000);
    expect(spy).toHaveBeenCalledThrice();
  });

  it("should take time interval from params", function(){
    var foo = function(retry){ retry(); }
    var spy = sinon.spy(foo);
    $.poll(500, spy);
    this.clock.tick(100);
    expect(spy).not.toHaveBeenCalled();
    this.clock.tick(500);
    expect(spy).toHaveBeenCalledOnce();
    this.clock.tick(1000);
    expect(spy).toHaveBeenCalledThrice();
  });

});

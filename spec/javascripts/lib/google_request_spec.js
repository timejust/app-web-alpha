describe("GoogleRequest", function(){

  describe("get", function(){

    it("should add method params and call request", function(){
      var options = {url: 'http://example.com'}
      var spy = sinon.stub(GoogleRequest, 'request');
      GoogleRequest.get(options);
      expect(spy).toHaveBeenCalledOnce();
      var params = {};
      params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
      expect(spy).toHaveBeenCalledWith(
        params,
        options
      );
      spy.restore();
    });

  });

  describe("post", function(){

    it("should add method params and call request", function(){
      var options = {url: 'http://example.com', params: {foo: 'bar'}}
      var spy = sinon.stub(GoogleRequest, 'request');
      GoogleRequest.post(options);
      expect(spy).toHaveBeenCalledOnce();
      var params = {};
      params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
      params[gadgets.io.RequestParameters.POST_DATA] = gadgets.io.encodeValues({foo: 'bar'});
      expect(spy).toHaveBeenCalledWith(
        params,
        options
      );
      spy.restore();
    });

  });

  describe("put", function(){

    it("should add method params and call request", function(){
      var options = {url: 'http://example.com', params: {foo: 'bar'}}
      var spy = sinon.stub(GoogleRequest, 'request');
      GoogleRequest.put(options);
      expect(spy).toHaveBeenCalledOnce();
      var params = {};
      params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.PUT;
      params[gadgets.io.RequestParameters.POST_DATA] = gadgets.io.encodeValues({foo: 'bar'});
      expect(spy).toHaveBeenCalledWith(
        params,
        options
      );
      spy.restore();
    });

  });

  describe("destroy", function(){

    it("should add method params and call request", function(){
      var options = {url: 'http://example.com'}
      var spy = sinon.stub(GoogleRequest, 'request');
      GoogleRequest.destroy(options);
      expect(spy).toHaveBeenCalledOnce();
      var params = {};
      params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.DELETE;
      expect(spy).toHaveBeenCalledWith(
        params,
        options
      );
      spy.restore();
    });

  });

  describe("request", function(){

    it("should use url", function(){
      var options = {url: 'http://example.com'}
      var params = {};
      var spy = sinon.stub(window.gadgets.io, 'makeRequest');
      GoogleRequest.request(params, options);
      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(
        "http://example.com"
      );
      spy.restore();
    });

    it("should add additional params", function(){
      GoogleRequest.additional_params = {foo: 'bar'};
      var options = {url: 'http://example.com'}
      var params = {};
      var spy = sinon.stub(window.gadgets.io, 'makeRequest');
      var params_spy = sinon.spy(GoogleRequest, 'addAdditionalParams');
      GoogleRequest.request(params, options);
      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(
        "http://example.com?foo=bar"
      );
      expect(params_spy).toHaveBeenCalledOnce();
      expect(params_spy).toHaveBeenCalledWith("http://example.com");
      spy.restore();
      params_spy.restore();
      GoogleRequest.additional_params = null;
    });

    it("should add content type as json", function(){
      var options = {url: 'http://example.com'}
      var options_spy = sinon.stub(GoogleRequest, 'prepareCallbacks');
      options_spy.returns(options);
      var spy = sinon.stub(window.gadgets.io, 'makeRequest');
      var params = {};
      params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
      GoogleRequest.request(params, options);
      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(
        "http://example.com",
        options,
        params
      );
      spy.restore();
      expect(options_spy).toHaveBeenCalledOnce();
      options_spy.restore();
    });

  });

  it("should use GoogleRequest.basic_auth if defined", function(){
    GoogleRequest.basic_auth = "base64auth";
    var options = {url: 'http://example.com'}
    var options_spy = sinon.stub(GoogleRequest, 'prepareCallbacks');
    options_spy.returns(options);
    var spy = sinon.stub(window.gadgets.io, 'makeRequest');
    var params = {};
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.HEADERS] = {
      "Authorization": "Basic base64auth"
    }
    GoogleRequest.request(params, options);
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith(
      "http://example.com",
      options,
      params
    );
    spy.restore();
    expect(options_spy).toHaveBeenCalledOnce();
    options_spy.restore();
    GoogleRequest.basic_auth = null;
  });

  describe("addAdditionalParams", function(){

    it("should add params to url", function(){
      GoogleRequest.additional_params = {fooz: 'barz'};
      url = GoogleRequest.addAdditionalParams('http://test.example.com');
      expect(url).toBe('http://test.example.com?fooz=barz');
      url = GoogleRequest.addAdditionalParams('http://test.example.com?foo=bar');
      expect(url).toBe('http://test.example.com?foo=bar&fooz=barz');
      url = GoogleRequest.addAdditionalParams('http://test.example.com?foo=bar');
      GoogleRequest.additional_params = {fooz: 'barz', barz: 'fooz'};
      url = GoogleRequest.addAdditionalParams('http://test.example.com?foo=bar&bar=foo');
      expect(url).toBe('http://test.example.com?foo=bar&bar=foo&fooz=barz&barz=fooz');
      GoogleRequest.additional_params = null;
    });

  });

  describe("prepareCallback", function(){

    it("should use success method from options", function(){
      var success = sinon.spy();
      var error = sinon.spy();
      var callback = GoogleRequest.prepareCallbacks({success: success, error: error});
      callback({rc: 200});
      expect(success).toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it("should use error method from options", function(){
      var success = sinon.spy();
      var error = sinon.spy();
      var callback = GoogleRequest.prepareCallbacks({success: success, error: error});
      callback({rc: 404});
      expect(error).toHaveBeenCalled();
      expect(success).not.toHaveBeenCalled();
      callback({rc: 500});
      expect(error).toHaveBeenCalled();
      expect(success).not.toHaveBeenCalled();
    });

  });

});

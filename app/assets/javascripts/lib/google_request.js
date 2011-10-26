/*
 * Wrapper around gadgets.io.makeRequest to perform
 * requests on external services
 */
var GoogleRequest = {
  /**
   * Perform a get request
   * @param {String}    url
   * @param {String}    params
   * @param {Object}  options
   */
  get: function(options){
    var g_params = {};
    g_params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
    this.request(g_params, options);
  },

  /**
   * Perform a post request
   * @param {String}    url
   * @param {String}    params
   * @param {Object}  options
   */
  post: function(options){
    var g_params = {};
    g_params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
    if (options.params) {
      g_params[gadgets.io.RequestParameters.POST_DATA] = gadgets.io.encodeValues(options.params);
    }
    this.request(g_params, options);
  },

  /**
   * Perform a put request
   * @param {String}    url
   * @param {String}    params
   * @param {Object}  options
   */
  put: function(options){
    var g_params = {};
    g_params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.PUT;
    if (options.params) {
      g_params[gadgets.io.RequestParameters.POST_DATA] = gadgets.io.encodeValues(options.params);
    }
    this.request(g_params, options);
  },

  /**
   * Perform a delete request
   * @param {String}    url
   * @param {String}    params
   * @param {Object}  options
   */
  destroy: function(options){
    var g_params = {};
    g_params[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.DELETE;
    this.request(g_params, options);
  },

  /**
   * Perform a request
   * @param {String}    method
   * @param {String}    url
   * @param {String}    params
   * @param {Object}  options
   */
  request: function(g_params, options){
    var url = options.url;
    if (GoogleRequest.basic_auth) {
      g_params[gadgets.io.RequestParameters.HEADERS] = {
        "Authorization": "Basic " + GoogleRequest.basic_auth
      }
    }
    url = this.addAdditionalParams(url);
    g_params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
    gadgets.io.makeRequest(
      url,
      this.prepareCallbacks(options),
      g_params
    );
  },

  /**
    * Parse options to add callbacks and return a function
    *
    * @param {Object} options
    *
    * @return {Function}
    */
  prepareCallbacks: function(options){
    return function(response) {
      if (options.error && (
          String(response.rc).indexOf('4') == 0 ||
          String(response.rc).indexOf('5') == 0
      )) {
        options.error(response);
      }
      else if (options.success) {
        options.success(response);
      }
    }
  },

  /*
   * Append additional parameters to url using GoogleRequest.additional_params
   *
   * @param {String}  url
   *
   * @return {String}
   */
  addAdditionalParams: function(url){
    if (GoogleRequest.additional_params){
      var params = $.param(GoogleRequest.additional_params);
      url = (url.indexOf('?') > 0 ? url += "&" + params : url += "?" + params);
    }
    return url;
  }
};

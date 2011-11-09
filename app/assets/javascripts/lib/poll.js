// Wrapper for Polling requests
$.poll = function(ms, callback) {
  if ($.isFunction(ms)) {
    callback = ms;
    ms = 1000;
  }
  (function retry() {
    setTimeout(function() {
      callback(retry);
    }, ms);
  })();
};

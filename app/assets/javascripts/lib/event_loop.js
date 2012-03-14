/**
 * event_loop.js
 * Cookie based event loop class
 */
var EventLoop = {
  events: {
    'poll #event_polling'         : 'handleEvent',
  },
  initialize: function(callback) {
    this.running = false;
    this.seed = Math.floor(Math.random() * 11);
    this.eventKey = this.seed + "_event";
    this.callback = callback;
  },
  run: function() {
    if (this.running != true) {
      timejust.setCookie(this.eventKey, null);
      e.trigger('poll');         
      this.running = true 
    } 
  },
  handleEvent: function(e) {
    var self = this;
    $.poll(200, function(retry) {
      var ev = $.cookie(this.eventKey);    
      if (ev == null || ev == "") {
        retry();
      } else {  
        this.callback();
        timejust.setCookie('event', null);
        retry();
      }  
    });                 
  }
}
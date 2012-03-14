/**
 * event_loop.js
 * Cookie based event loop class
 */
function EventLoop() {
  var instance;
  
  this.running = false;
  this.seed = Math.floor(Math.random() * 101);
  this.eventKey = this.seed + "_event";
  this.callback = null;  
  this.el = null;
    
  this.run = function() {
    var self = this;
    if (this.running != true) {
      timejust.setCookie(this.eventKey, null);
      if (this.el != null) {
        this.el.bind('poll', function(e, eventKey) {
          $.poll(200, function(retry) {
            var ev = $.cookie(eventKey);                
            if (ev != null && ev != "") {
              ev = eval('(' + ev + ')');      
              self.callback(ev.type, ev.params);
              timejust.setCookie(eventKey, null);
            }  
            retry();
          });                 
        });
        this.el.trigger('poll', this.eventKey, this.callback);         
        this.running = true  
      }      
    } 
  };  
}

EventLoop.sendEvent = function(ev, eventKey) {
  var json = JSON.stringify(ev, EventLoop.replacer);
  timejust.setCookie(eventKey, json);
}

EventLoop.getInstance = function() {
  if (EventLoop.instance == null)
    EventLoop.instance = new EventLoop();
  return EventLoop.instance;
}

EventLoop.replacer = function(key, value) {
  if (typeof value === 'number' && !isFinite(value)) {
      return String(value);
  }
  return value;
};

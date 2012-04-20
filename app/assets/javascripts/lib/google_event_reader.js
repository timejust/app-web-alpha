/**
 * google_event_reader.js
 * 
 */
function GoogleEventReader() {
  var instance;  
  var self = this;
  this.taskQueue = new Array();   
  this.read = function(email, currentTime, dayDiff, callback, cutoff, params) {
    var startDate = {};
    var endDate = {};
    if (dayDiff > 0) {
      startDate = utils.getTimeWithMinuteDiff(currentTime, 1);
      endDate = utils.getTimeWithDayDiff(currentTime, dayDiff);
      if (cutoff) {
        endDate.hour = 0;
        endDate.minute = 0;
        endDate.second = 0;
      }
    } else {
      if (cutoff && currentTime.hour > 0) {        
        startDate = utils.getTimeWithDayDiff(currentTime, dayDiff + 1);  
        startDate.hour = 0;
        startDate.minute = 0;
        startDate.second = 0;
      } else {
        startDate = utils.getTimeWithDayDiff(currentTime, dayDiff);  
      }      
      endDate = utils.getTimeWithMinuteDiff(currentTime, -1);
    }
    this.taskQueue.push({email: email, startTime: startDate, 
      endTime: endDate, callback: callback, params: params});          
    if (this.taskQueue.length == 1) {
      this.getCalendarEvent(email, startDate, endDate, callback);
    }
  }
  this.readEvent = function(email, startTime, endTime, callback) {
    this.taskQueue.push({email: email, startTime: startTime, 
      endTime: endTime, callback: callback});                
    if (this.taskQueue.length == 1) {
      this.getCalendarEvent(email, startTime, endTime, callback);
    }
  }  
  this.getCalendarEvent = function(email, startTime, endTime, callback) {    
    var optionalParms = {'requestedFields': ['details']};
    google.calendar.read.getEvents(this.handleEventCallback, [email], 
      startTime, endTime, optionalParms);    
  }
  this.handleEventCallback = function(response) {
    var queue = self.taskQueue;
    if (queue.length > 0) {
      queue[0].callback(response, queue[0].params);
      queue.splice(0, 1);          
      if (queue.length > 0) {
        var r = queue[0];
        self.getCalendarEvent(r.email, r.startTime, r.endTime, r.callback);
      }  
    }    
  }
}

GoogleEventReader.getInstance = function() {
  if (GoogleEventReader.instance == null)
    GoogleEventReader.instance = new GoogleEventReader();
  return GoogleEventReader.instance;
}


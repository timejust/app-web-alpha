/**
 * calendar_reader.js
 * 
 */
function CalendarReader() {
  var instance;  
  var self = this;
  this.taskQueue = new Array();   
  this.read = function(email, currentTime, dayDiff, callback, cutoff, params) {
    var startDate = {};
    var endDate = {};
    if (dayDiff > 0) {
      // startDate = utils.getTimeWithMinuteDiff(currentTime, 1);
      startDate = currentTime
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
    alert(startDate.year + "-" + startDate.month + "-" + startDate.date + " " + startDate.hour + ":" + startDate.minute + ":" + startDate.second)
    alert(endDate.year + "-" + endDate.month + "-" + endDate.date + " " + endDate.hour + ":" + endDate.minute + ":" + endDate.second)
    
    startDate = utils.timeToUnix(startDate);
    endDate = utils.timeToUnix(endDate);

    alert("start: " + startDate + ", end: " + endDate)
    
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
    var self = this;
    GoogleRequest.get({
      url: App.config.service_url + "/v1/calendar/" + email + 
           "/events?start=" + startTime + "&end=" + endTime + 
           "&type=event-calendar" + "&nocache=" + new Date().getTime(),         
      error: function() {
        self.handleEventCallback(null);
      },
      success: function(resp) {
        if (resp.rc != 200)                    
          self.handleEventCallback(null);
        else
          self.handleEventCallback(resp.data);
      }          
    });
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

CalendarReader.getInstance = function() {
  if (CalendarReader.instance == null)
    CalendarReader.instance = new CalendarReader();
  return CalendarReader.instance;
}


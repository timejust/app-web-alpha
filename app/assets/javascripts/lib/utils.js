var utils = {
  timeToUnix: function(time) {
    var date = new Date(
      Date.UTC(time.year, 
               time.month-1, 
               time.date, 
               time.hour, 
               time.minute, 
               time.second, 
               0)
    );
    // date.setFullYear(time.year, time.month-1, time.date);
    // date.setHours(time.hour, time.minute, time.second, 0);
    return parseInt(date / 1000);
  },
  timeCompare: function(t1, t2) {
    var rawTime1 = utils.timeToUnix(t1);
    var rawTime2 = utils.timeToUnix(t2);    
    if (rawTime1 > rawTime2) {
      return 1;
    } else if (rawTime1 == rawTime2) {
      return 0;
    } 
    return -1;
  },
  rfc3389ToUTCTimeObject: function(r) {
    date = new Date(Date.parse(r));
    return {year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, date: date.getUTCDate(), 
        hour: date.getUTCHours(), minute: date.getUTCMinutes(), second: date.getUTCSeconds()};
  },
  rfc3389ToTimeObject: function(r) {    
    date = new Date(Date.parse(r));
    return {year: date.getFullYear(), month: date.getMonth() + 1, date: date.getDate(), 
        hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds()};
  },
  getTimeWithDiff: function(time, diff) {
    var unixtime = utils.timeToUnix(time);//parseInt(date / 1000);
    unixtime += diff;
    date = new Date(unixtime * 1000);
    return {year: date.getFullYear(), month: date.getMonth() + 1, date: date.getDate(), 
        hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds()};
  },
  // Recalculate date object with the given date difference
  getTimeWithDayDiff: function(time, diff) {
    return utils.getTimeWithDiff(time, (diff * 60 * 60 * 24));
  },
  // Recalculate date object with the given date difference
  getTimeWithMinuteDiff: function(time, diff) {
    return utils.getTimeWithDiff(time, (diff * 60));
  },
  copyTimeObject: function(o) {
    var n = {};
    n.year = o.year;
    n.month = o.month;
    n.date = o.date;
    n.hour = o.hour;
    n.minute = o.minute;
    n.second = o.second;
    return n;
  }
}
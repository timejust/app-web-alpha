# encoding: UTF-8
require 'cgi'

module Timejust
  class TimeWithTimezone
    def initialize(timezone, local_time)  
      @@timezone = timezone
      @@local_time = local_time
      @@timezone_dictionary = {'Europe/Paris' => 1} 
    end

    def set_timezone(tz)
      @@timezone = tz      
    end    
    
    def time_difference(tz)
      if @@timezone_dictionary[tz] == nil
        return 0
      else
        return @@timezone_dictionary[tz]
      end
    end
    
    def utc_time()
      (@@local_time - (self.time_difference(@@timezone) * 60 * 60))
    end
    
    def time()
      (@@local_time.utc + (self.time_difference(@@timezone) * 60 * 60))
    end
  end
end

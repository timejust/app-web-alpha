# encoding: utf-8

class TjEvent
  @calendar_id = ""
  @start = 0
  @end_ = 0
  @lat = 0.0
  @lng = 0.0
  @location = ""
  @summary = ""
  @description = ""
  
  def to_json
    {      
      "calendarId" => @calendar_id,
      "start" => @start,
      "end" => @end_,
      "position" => {
        "lat" => @lat,
        "lng" => @lng
        },
      "location" => @location,
      "summary" => @summary,
      "description" => @description          
    }
  end  
end
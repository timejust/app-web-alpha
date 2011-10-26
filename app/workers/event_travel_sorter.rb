# encoding: UTF-8
class EventTravelSorter
  @queue = :event_travel_sorter

  def self.perform(event_id)
    event = Event.first(conditions: {id: event_id})

    event.travels.each do |travel|
      cal = Travel.shared_calendars[travel.travel_mode]
      if cal && (cal_name = cal[:name])
        travel.update_attribute(:calendar, cal_name)
      end
    end

    Resque.enqueue(EventSaver, event_id)
  end
end

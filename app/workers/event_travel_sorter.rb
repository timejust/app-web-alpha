# encoding: UTF-8
class EventTravelSorter
  @queue = :event_travel_sorter

  def self.perform(event_id)
    Timejust::LatencySniffer.new('Resque:EventTravelSorter:enqueue', event_id, 'ended')
    Timejust::LatencySniffer.new('Event:EventTravelSorter', event_id, 'started')
    event = Event.first(conditions: {id: event_id})
    
    event.travels.each do |travel|
      cal = Travel.shared_calendars[travel.travel_mode]
      if cal && (cal_name = cal[:name])
        travel.update_attribute(:calendar, cal_name)
      end
    end
    
    Timejust::LatencySniffer.new('Resque:EventSaver:enqueue', event_id, 'started')
    Resque.enqueue(EventSaver, event_id)
    Timejust::LatencySniffer.new('Event:EventTravelSorter', event_id, 'ended')
  end
end

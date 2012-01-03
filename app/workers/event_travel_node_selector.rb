# encoding: UTF-8
include ActionView::Helpers::TextHelper
class EventTravelNodeSelector
  @queue = :event_travel_node_selector

  def self.event_title(event)
    "#{truncate(event.title, length: 50)} - #{I18n.l(event.start_time, format: :short)} - #{I18n.l(event.end_time, format: :short)}"
  end

  def self.perform(event_id, ip)
    timer = Timejust::LatencySniffer.new('Event:EventTravelNodeSelector')
    timer.start()
    
    etimer = Timejust::LatencySniffer.new('Task:MongoSingleEventQuery')
    utimer = Timejust::LatencySniffer.new('Task:MongoSingleUserQuery')
    ftimer = Timejust::LatencySniffer.new('Task:MongoFetchEvent')
    
    etimer.start()
    event = Event.first(conditions: {id: event_id})
    etimer.end()

    # only travel_nodes_progress
    return unless event.travel_nodes_progress?

    utimer.start()
    user = User.first(conditions: {id: event.user_id})
    utimer.end()

    ftimer.start()
    
    # clear all old proposals
    event.previous_travel_nodes.destroy_all
    event.current_travel_nodes.destroy_all
    #event.next_travel_nodes.destroy_all

    # add confirmed travel_node in travel nodes proposals
    event.add_confirmed_travel_node_to_proposals

    event.fetch_around_events

    # try to find previous and next locations
    event.previous_events.each do |previous_event|
      event.previous_travel_nodes.create(
        address: previous_event.location,
        title: self.event_title(previous_event),
        weight: 100,
        tag: 'event_location',
        event_title: previous_event.title,
        event_start_time: previous_event.start_time,
        event_end_time: previous_event.end_time,
        event_location: previous_event.location,
        event_google_id: previous_event.google_id
      )
    end

    event.next_events.each do |next_event|
      event.next_travel_nodes.create(
        address: next_event.location,
        title: self.event_title(next_event),
        weight: 100,
        tag: 'event_location',
        event_title: next_event.title,
        event_start_time: next_event.start_time,
        event_end_time: next_event.end_time,
        event_location: next_event.location,
        event_google_id: next_event.google_id
      )
    end

    # Get location from current event
    if event.location.present?
      event.current_travel_nodes.create(
        address: event.location,
        title: self.event_title(event),
        weight: 100,
        tag: 'event_location',
        event_title: event.title,
        event_start_time: event.start_time,
        event_end_time: event.end_time,
        event_location: event.location,
        event_google_id: event.google_id
      )
    end

    event.extract_favorite_locations_from_addresses

    # Add user favorite_locations in proposals
    user.favorite_locations.each do |location|
      event.previous_travel_nodes.create(address: location['address'], title: location['title'], weight: 50, tag: 'favorite')
      event.current_travel_nodes.create(address: location['address'], title: location['title'], weight: 50, tag: 'favorite')
      #event.next_travel_nodes.create(address: location['address'], title: location['title'], weight: 50, tag: 'favorite')
    end
    
    ftimer.end()
    
    Resque.enqueue(EventNormalizer, event_id, ip)
    timer.end()
  end
end

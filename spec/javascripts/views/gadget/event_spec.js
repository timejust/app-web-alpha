describe("EventView", function() {

  beforeEach(function() {
    // A basic js event object
    this.js_event = { preventDefault: function(){} };

    // A google event object from calendar gadget
    // TODO : use Factory
    this.google_event = {
      'id': 42,
      'title': 'test',
      'location': '15 rue poisonnières, Paris',
      'startTime': 'Wed Aug 31 2011 12:29:05 GMT+0200 (CEST)',
      'endTime': 'Wed Aug 31 2011 12:29:05 GMT+0200 (CEST)',
      'calendar': {
        'name': 'timejust.dev.af83@gmail.com'
      }
    };

    // Insert selectedEvent div needed for EventView
    $('#jasmine_content').html('<div id="selectedEvent"></div>');

    var ip = "192.168.0.1";
    var user = new User();
    user.email = "test@test.com";
    
    // Init EventView
    this.view = new App.Views.EventView({ 
      el: $('#selectedEvent').get(0), 
      ip: ip,  
      user: user });
  });

  describe("Initialize", function() {

    it("should initialize variables", function() {
      expect(this.view.selectedEvent).toEqual(undefined);
      expect(this.view.apiEvent).toEqual(undefined);
    });

    it("should call render", function() {
      var spy = sinon.spy(this.view, 'render');
      this.view.initialize();
      this.view.onAlias({rc: 200, data: "ok"})

      expect(spy).toHaveBeenCalledOnce();
      this.view.render.restore();
    });

    it("should bind google.calendar.read.subscribeToEvents on calendarEventOccured", function() {
      window.google.calendar.read = {
        subscribeToEvents: function(){}
      };
      var spy = sinon.spy(window.google.calendar.read, 'subscribeToEvents');

      this.view.initialize();

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith(this.view.calendarEventOccured);
    });

  });

  describe("calendarEventOccured", function() {

    it("should set current event if not null", function() {
      this.view.isInitialized = true;
      this.view.calendarEventOccured(null);
      expect(this.view.selectedEvent).toBe(null);

      this.view.calendarEventOccured({'id': null});
      expect(this.view.selectedEvent).toBe(null);

      window.google.calendar.read: {
        getEvents: function(a, b, c, d, e) {}
      };  
      this.view.calendarEventOccured(this.google_event);
      expect(this.view.selectedEvent).toBe(this.google_event);
    });

    it("should render current event", function() {
      var window_mock = sinon.mock(window.gadgets.window);
      window_mock.expects('adjustHeight').once();

      this.view.calendarEventOccured(this.google_event);

      expect($(this.view.el).find('p.title')).toHaveText(this.google_event.title);
      expect($(this.view.el).find('p.location')).toHaveText(this.google_event.location);
      expect($(this.view.el).find('p.timefromto')).toHaveText($.format.date(this.google_event.startTime, App.config.time)+' - '+$.format.date(this.google_event.endTime, App.config.time));
      expect($(this.view.el).find('a.get_there')).toHaveText('Generate Trip');

      expect($(this.view.el)).toContain('.before_offset');
      expect($(this.view.el).find('.before_offset')).toContain('select[name=before_offset]');
      expect($(this.view.el).find('.before_offset select[name=before_offset]').val()).toBe('10');
      expect($(this.view.el)).toContain('.after_offset');
      expect($(this.view.el).find('.after_offset')).toContain('select[name=after_offset]');
      expect($(this.view.el).find('.after_offset select[name=after_offset]').val()).toBe('15');

      window_mock.verify();
      window_mock.restore();
    });

    it("should not assign selectedEvent is event is from a calendar listed in App.config.calendar_names", function(){

      App.config.calendar_names = ['xTimejustYellow']
      this.google_event['calendar']['name'] = 'xTimejustYellow'
      this.view.calendarEventOccured(this.google_event);
      expect(this.view.selectedEvent).toBe(undefined);
    });

  });

  describe("generate trip", function(){

    it("should generateTrip on .generate_trip click event", function(){
      var google_request = sinon.spy(GoogleRequest, 'post');

      this.view.calendarEventOccured(this.google_event);
      $(this.view.el).find('.generate_trip').trigger('click');

      expect(google_request).toHaveBeenCalledOnce();
      google_request.restore();
    });

    it("should make request to API on generateTrip", function(){
      var show_loader_spy = sinon.spy(window, 'showLoader');
      var js_event_spy = sinon.spy(this.js_event, 'preventDefault');
      var google_request = sinon.spy(GoogleRequest, 'post');

      this.view.selectedEvent = this.google_event;
      this.view.render();
      $(this.view.el).find('select[name=before_offset]').val('60');
      $(this.view.el).find('select[name=after_offset]').val('30');

      this.view.generateTrip(this.js_event);

      expect(js_event_spy).toHaveBeenCalledOnce();
      expect(show_loader_spy).toHaveBeenCalledOnce();
      expect(google_request).toHaveBeenCalledOnce();
      expect(google_request).toHaveBeenCalledWith({
        url: App.config.api_url + "/events",
        params: {
          event: JSON.stringify($.extend(
            this.view.selectedEvent,
            {
              before_start_time: '60',
              after_end_time: '30'
            }
          ))
        },
        success: this.view.generateTripCallback,
        error: this.view.error
      });
      js_event_spy.restore();
      show_loader_spy.restore();
      google_request.restore();
    });

  });

  describe("error", function(){

    it("should display generic message if response is not a 401", function(){
      this.view.render();
      this.view.error({rc: 500});
      expect($(this.view.el).find('.error')).toHaveText("An error occurred when calculating your route, please try again");
    });

    it("should display unauthorized message if response is a 401", function(){
      this.view.render();
      this.view.error({rc: 401});
      expect($(this.view.el).find('.error')).toHaveHtml("You must authorize Timejust to access your calendar by clicking : <a href='" + App.config.web_url + "/oauth2/authorize?return_to=http://google.com/calendar' target='blank'>here</a>");
    });
  });

});

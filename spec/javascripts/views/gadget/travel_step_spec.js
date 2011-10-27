describe("TravelStepView", function(){

  describe("render", function(){

    it("should render ratp travel", function(){
      var travel_step = new App.Models.TravelStep();
      travel_step.set({
        _id: 42,
        provider: 'ratp',
        departure_time: 'Wed Aug 31 2011 11:29:05 GMT+0200 (CEST)',
        arrival_time: 'Wed Aug 31 2011 12:29:05 GMT+0200 (CEST)',
        estimated_time: 9,
        steps: ['step1', 'step2'],
        public_url: "http://example.com",
        travel_type: 'backward',
        calendar: "BlackProposal",
        steps_count: 8,
        summary: ['metro', 'tram']
      });
      var view = new App.Views.TravelStepView({ model: travel_step });
      var el = $(view.render().el);

      expect(el).toHaveClass('travel_step');
      expect(el).toHaveClass('ratp');
      expect(el).toHaveClass('backward');
      expect(el).toContain('.confirm');
      expect(el).toContain('.destroy');
      expect(el).toContain('.bookmark');
      expect(el).toContain('.steps_toggle');

      expect(el.find('.steps_summary')).toHaveText(/metro-tram/);
      expect(el.find('.steps_summary')).toContain('span.BlackProposal');
      expect(el.find('.departure_time')).toHaveText($.format.date(travel_step.get('departure_time'), App.config.time));
      expect(el.find('.arrival_time')).toHaveText($.format.date(travel_step.get('arrival_time'), App.config.time));
      expect(el.find('.estimated_time')).toHaveText(travel_step.get('estimated_time') + " min");
      expect(el.find(".steps_count")).toBeTruthy();
      expect(el.find('.steps_count')).toHaveText(travel_step.get('steps_count') + " stop(s)");
      expect(el.find('.steps')).toHaveText(/step1/);
      expect(el.find('.steps')).toHaveText(/step2/);
      expect(el.find('.public_url')).toHaveHtml('<a href="http://example.com" target="_blank">Show</a>');
    });

    it("should render google-directions travel", function(){
      var travel_step = new App.Models.TravelStep();
      travel_step.set({
        _id: 42,
        provider: 'google-directions',
        departure_time: 'Wed Aug 31 2011 11:29:05 GMT+0200 (CEST)',
        arrival_time: 'Wed Aug 31 2011 12:29:05 GMT+0200 (CEST)',
        estimated_time: 9,
        distance: "42 km",
        steps: ['step1', 'step2'],
        public_url: "http://example.com",
        travel_type: 'backward',
        calendar: 'BlackProposal',
        summary: ['car']
      });
      var view = new App.Views.TravelStepView({ model: travel_step });
      var el = $(view.render().el);

      expect(el).toHaveClass('travel_step');
      expect(el).toHaveClass('google-directions');
      expect(el).toHaveClass('backward');
      expect(el).toContain('.confirm');
      expect(el).toContain('.destroy');
      expect(el).toContain('.bookmark');

      expect(el.find('.steps_summary')).toHaveText(/car/);
      expect(el.find('.steps_summary')).toContain('span.BlackProposal');
      expect(el.find('.departure_time')).toHaveText($.format.date(travel_step.get('departure_time'), App.config.time));
      expect(el.find('.arrival_time')).toHaveText($.format.date(travel_step.get('arrival_time'), App.config.time));
      expect(el.find('.estimated_time')).toHaveText(travel_step.get('estimated_time') + " min");
      expect(el.find('.distance')).toHaveText(/42/);
      expect(el.find('.steps')).toHaveText(/step1/);
      expect(el.find('.steps')).toHaveText(/step2/);
      expect(el.find('.public_url')).toHaveHtml('<a href="http://example.com" target="_blank">Show</a>');
    });

    it("should render unsuported provider", function(){
      var travel_step = new App.Models.TravelStep();
      travel_step.set({
        provider: 'fake_provider'
      });
      var view = new App.Views.TravelStepView({ model: travel_step });
      var el = $(view.render().el);

      expect(el).toHaveClass('travel_step');
      expect(el.find('p')).toHaveText(/Travel provider fake_provider not supported by gadget/);
    });

    it("should render error", function(){
      var travel_step = new App.Models.TravelStep();
      travel_step.set({
        provider: 'ratp',
        state: 'error',
        travel_type: 'forward'
      });
      var view = new App.Views.TravelStepView({ model: travel_step });
      var el = $(view.render().el);

      expect(el).toHaveClass('travel_step');
      expect(el.find('p')).toHaveText(/Address not yet supported for public transportation./);
    });

    it("should not render steps_count", function() {
      var travel_step = new App.Models.TravelStep();
      travel_step.set({
        _id: 42,
        provider: 'ratp',
        departure_time: 'Wed Aug 31 2011 11:29:05 GMT+0200 (CEST)',
        arrival_time: 'Wed Aug 31 2011 12:29:05 GMT+0200 (CEST)',
        estimated_time: 9,
        steps: ['step1', 'step2'],
        public_url: "http://example.com",
        travel_type: 'backward',
        calendar: "BlackProposal",
        steps_count: 0,
        summary: ['metro', 'tram']
      });
      var view = new App.Views.TravelStepView({ model: travel_step });
      var el = $(view.render().el);

      expect(el.find(".steps_count").html()).not.toBeTruthy();
      expect(el.find('.steps_count')).not.toHaveText(travel_step.get('steps_count') + " stop(s)");
    });

  });

  describe("actions", function(){

    beforeEach(function(){
      var travel_step = new App.Models.TravelStep();
      this.view = new App.Views.TravelStepView({ model: travel_step });
    });

    describe("destroyTravel", function(){
      it("should call destroy on model", function(){
        var event_spy = sinon.spy();
        var model_spy = sinon.spy(this.view.model, 'destroy');
        this.view.destroy({ preventDefault: function(){ event_spy(); } });
        expect(model_spy).toHaveBeenCalledOnce();
        expect(model_spy).toHaveBeenCalledWith({
          success: this.view.successOnDestroy,
          error: this.view.errorOnDestroy
        });
        model_spy.restore();
        expect(event_spy).toHaveBeenCalledOnce();
      });
    });

    describe("confirmTravel", function(){

      it("should call confirm on model", function(){
        var event_spy = sinon.spy();
        var model_spy = sinon.spy(this.view.model, 'confirm');
        this.view.confirm({ preventDefault: function(){ event_spy(); } });
        expect(model_spy).toHaveBeenCalledOnce();
        expect(model_spy).toHaveBeenCalledWith({
          success: this.view.successOnConfirm,
          error: this.view.errorOnConfirm
        });
        model_spy.restore();
        expect(event_spy).toHaveBeenCalledOnce();
      });

    });

    describe("bookmarkTravel", function(){
      it("should call bookmark on model", function(){
        var event_spy = sinon.spy();
        var model_spy = sinon.spy(this.view.model, 'bookmark');
        this.view.bookmark({ preventDefault: function(){ event_spy(); } });
        expect(model_spy).toHaveBeenCalledOnce();
        expect(model_spy).toHaveBeenCalledWith({
          success: this.view.successOnBookmark,
          error: this.view.errorOnBookmark
        });
        model_spy.restore();
        expect(event_spy).toHaveBeenCalledOnce();
      });
    });

    describe("actions errors", function(){

      beforeEach(function(){
        var travel_step = new App.Models.TravelStep();
        travel_step.set({
          _id: 42,
          provider: 'ratp',
          departure_time: 'Wed Aug 31 2011 11:29:05 GMT+0200 (CEST)',
          arrival_time: 'Wed Aug 31 2011 12:29:05 GMT+0200 (CEST)',
          estimated_time: 9,
          steps: ['step1', 'step2'],
          public_url: "http://example.com",
          travel_type: 'backward',
          calendar: "BlackProposal"
        });
        this.view.model = travel_step;
        this.view.loader = $('<img class="loader" src="" />');
        this.view.render();
      });

      it("waitForAction should clear error message, hide action link and insert loader", function(){
        expect($(this.view.el).find('.destroy').css('display')).toBe('');
        expect($(this.view.el)).not.toContain('.loader');
        this.view.waitForAction('destroy');
        expect($(this.view.el).find('.destroy')).toBeHidden();
        expect($(this.view.el)).toContain('.loader');
      })

      it("errorOnDestroy should hide loader, show destroy button and display error message", function(){
        this.view.waitForAction('destroy');
        expect($(this.view.el).find('.destroy')).toBeHidden();
        expect($(this.view.el)).toContain('.loader');
        this.view.errorOnDestroy();
        expect($(this.view.el).find('.destroy').css('display')).toBe('');
        expect($(this.view.el)).not.toContain('.loader');
        expect($(this.view.el).find('.error')).toHaveText("An error occurred while deleting your trip");
      });

      it("errorOnConfirm should hide loader, show confirm button and display error message", function(){
        this.view.waitForAction('confirm');
        expect($(this.view.el).find('.confirm')).toBeHidden();
        expect($(this.view.el)).toContain('.loader');
        this.view.errorOnConfirm();
        expect($(this.view.el).find('.confirm').css('display')).toBe('');
        expect($(this.view.el)).not.toContain('.loader');
        expect($(this.view.el).find('.error')).toHaveText("An error occurred while confirmation of your trip");
      });

      it("errorOnBookmark should hide loader, show bookmark button and display error message", function(){
        this.view.waitForAction('bookmark');
        expect($(this.view.el).find('.bookmark')).toBeHidden();
        expect($(this.view.el)).toContain('.loader');
        this.view.errorOnBookmark();
        expect($(this.view.el).find('.bookmark').css('display')).toBe('');
        expect($(this.view.el)).not.toContain('.loader');
        expect($(this.view.el).find('.error')).toHaveText("An error occurred while bookmarking your trip");
      });

    });

    describe("actions success", function(){

      beforeEach(function(){
        var travel_step = new App.Models.TravelStep();
        travel_step.set({
          _id: 42,
          provider: 'ratp',
          departure_time: 'Wed Aug 31 2011 11:29:05 GMT+0200 (CEST)',
          arrival_time: 'Wed Aug 31 2011 12:29:05 GMT+0200 (CEST)',
          estimated_time: 9,
          steps: ['step1', 'step2'],
          public_url: "http://example.com",
          travel_type: 'backward',
          calendar: "BlackProposal"
        });
        this.view.model = travel_step;
        this.view.loader = $('<img class="loader" src="" />');
        this.view.render();
      });

      it("successOnDestroy should remove item, display message and lock", function(){
        var calendar_mock = sinon.mock(google.calendar);
        calendar_mock.expects('refreshEvents').once();
        var gadgets_mock = sinon.mock(gadgets.window);
        gadgets_mock.expects('adjustHeight').once();
        var view_mock = sinon.mock(this.view);
        view_mock.expects('lock').once();
        view_mock.expects('removeTravelHeaders').once();

        this.view.successOnDestroy();

        expect($(this.view.el)).toHaveHtml("<p>Travel canceled</p>");

        view_mock.verify();
        calendar_mock.verify();
        gadgets_mock.verify();
        view_mock.restore();
        calendar_mock.restore();
        gadgets_mock.restore();
      });

      it("successOnConfirm should remove item, display message and lock", function(){
        var calendar_mock = sinon.mock(google.calendar);
        calendar_mock.expects('refreshEvents').once();
        var gadgets_mock = sinon.mock(gadgets.window);
        gadgets_mock.expects('adjustHeight').once();
        var view_mock = sinon.mock(this.view);
        view_mock.expects('removeSameTravelSteps').once();
        view_mock.expects('lock').once();
        view_mock.expects('removeTravelHeaders').once();

        this.view.successOnConfirm();

        expect($(this.view.el)).toHaveHtml("<p>Please check your inbox</p>");

        view_mock.verify();
        calendar_mock.verify();
        gadgets_mock.verify();
        view_mock.restore();
        calendar_mock.restore();
        gadgets_mock.restore();
      });

      it("successOnBookmark should show bookmark link, hide loader and lock", function(){
        this.view.waitForAction('bookmark');

        var calendar_mock = sinon.mock(google.calendar);
        calendar_mock.expects('refreshEvents').once();
        var gadgets_mock = sinon.mock(gadgets.window);
        gadgets_mock.expects('adjustHeight').once();
        var view_mock = sinon.mock(this.view);
        view_mock.expects('removeSameTravelSteps').once();
        view_mock.expects('lock').once();
        view_mock.expects('removeTravelHeaders').once();

        expect($(this.view.el).find('.bookmark')).toBeHidden();
        expect($(this.view.el)).toContain('.loader');

        this.view.successOnBookmark();

        expect($(this.view.el)).not.toContain('.loader');
        expect($(this.view.el).find('.bookmark').css('display')).toBe('');

        view_mock.verify();
        calendar_mock.verify();
        gadgets_mock.verify();
        view_mock.restore();
        calendar_mock.restore();
        gadgets_mock.restore();
      });

    });

  });

  describe("toggleSteps (with ratp provider only)", function(){
    it("should show/hide steps", function(){
      var travel_step = new App.Models.TravelStep();
      travel_step.set({
        _id: 42,
        provider: 'ratp',
        departure_time: 'Wed Aug 31 2011 11:29:05 GMT+0200 (CEST)',
        arrival_time: 'Wed Aug 31 2011 12:29:05 GMT+0200 (CEST)',
        estimated_time: 9,
        steps: ['step1', 'step2'],
        travel_type: 'backward',
        calendar: "BlackProposal"
      });

      var view = new App.Views.TravelStepView({ model: travel_step });
      view.render();

      expect($(view.el).find('.steps')).toBeHidden();
      expect($(view.el).find('.steps_toggle')).toHaveClass('off');
      view.toggleSteps({preventDefault: function(){}});
      // FIXME : toBeVisible not working with toggle ?!?
      // expect($(view.el).find('.steps')).toBeVisible();
      expect($(view.el).find('.steps_toggle')).toHaveClass('on');
    });
  });

  describe("removeSameSteps", function(){

    it("should remove all div with class of trave_type model attribute but not the current one", function(){
      var travel_step = new App.Models.TravelStep();
      travel_step.set({
        _id: 42,
        provider: 'ratp',
        departure_time: 'Wed Aug 31 2011 11:29:05 GMT+0200 (CEST)',
        arrival_time: 'Wed Aug 31 2011 12:29:05 GMT+0200 (CEST)',
        estimated_time: 9,
        steps: ['step1', 'step2'],
        travel_type: 'backward',
        calendar: "BlackProposal"
      });
      var another_travel_step = new App.Models.TravelStep();
      another_travel_step.set({
        _id: 42,
        provider: 'google-directions',
        departure_time: 'Wed Aug 31 2011 11:29:05 GMT+0200 (CEST)',
        arrival_time: 'Wed Aug 31 2011 12:29:05 GMT+0200 (CEST)',
        estimated_time: 9,
        steps: ['step1', 'step2'],
        travel_type: 'backward',
        calendar: "BlackProposal"
      });
      var locked_travel_step = new App.Models.TravelStep();
      locked_travel_step.set({
        _id: 42,
        provider: 'another_provider',
        departure_time: 'Wed Aug 31 2011 11:29:05 GMT+0200 (CEST)',
        arrival_time: 'Wed Aug 31 2011 12:29:05 GMT+0200 (CEST)',
        estimated_time: 9,
        steps: ['step1', 'step2'],
        travel_type: 'backward',
        calendar: "BlackProposal"
      });
      var view = new App.Views.TravelStepView({ model: travel_step });
      var another_view = new App.Views.TravelStepView({ model: another_travel_step });
      var locked_view = new App.Views.TravelStepView({ model: locked_travel_step });

      view.render();
      another_view.render();
      locked_view.render();
      locked_view.lock();
      $('#jasmine_content').append(view.el);
      $('#jasmine_content').append(another_view.el);
      $('#jasmine_content').append(locked_view.el);

      expect($('#jasmine_content')).toContain('.travel_step.ratp.backward');
      expect($('#jasmine_content')).toContain('.travel_step.google-directions.backward');
      expect($('#jasmine_content')).toContain('.travel_step.another_provider.backward.lock');

      view.removeSameTravelSteps();

      expect($('#jasmine_content')).toContain('.travel_step.ratp.backward');
      expect($('#jasmine_content')).toContain('.travel_step.another_provider.backward.lock');
      expect($('#jasmine_content')).not.toContain('.travel_step.google-directions.backward');
      $("#jasmine_content").empty();
    });
  });

});

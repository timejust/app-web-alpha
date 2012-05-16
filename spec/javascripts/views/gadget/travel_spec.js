describe("TravelView", function(){
/*
  describe("initialize", function(){
    var travel = new App.Models.Travel();
    var view = new App.Views.TravelView({ model: travel });
    expect(view.model).toBe(travel)
  });

  describe("render", function(){

    it("should render each travel_steps with TravelStepView and display transports icon", function(){
      var travel_step_view = sinon.stub(App.Views.TravelStepView.prototype, 'initialize');
      var travel = new App.Models.Travel();
      travel.set({
        provider: 'fake_provider',
        transports: ['fake_transport', 'another_fake_transport'],
        calendar: 'xTimejustBlack',
        travel_steps: [
          {
            _id: 42,
            provider: 'fake_provider',
            state: 'waiting'
          },
          {
            _id: 24,
            provider: 'fake_provider',
            state: 'waiting'
          },
        ]
      });
      var view = new App.Views.TravelView({ model: travel });
      view.render();
      expect(travel_step_view).toHaveBeenCalledTwice();
      // TODO : assert called to render
      expect($(view.el).find('.icon').length).toBe(2);
      expect($(view.el)).toContain('.icon.fake_transport');
      expect($(view.el)).toContain('.icon.another_fake_transport');
    });

    it("should render error message if all travel_steps have errors", function(){
      var travel = new App.Models.Travel();
      travel.set({
        provider: 'ratp',
        travel_steps: [
          {
            _id: 42,
            provider: 'ratp',
            state: 'error'
          },
          {
            _id: 24,
            provider: 'ratp',
            state: 'error'
          },
        ]
      });
      var view = new App.Views.TravelView({ model: travel });
      expect($(view.render().el)).toHaveText(/Address not yet supported for public transportation/);
    });

  });
*/
});

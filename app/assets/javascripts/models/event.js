App.Models.Event = Backbone.Model.extend({
  url : function() {
    var base = App.config.api_url + '/events';
    if (this.isNew()) return base;
    return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
  }
});

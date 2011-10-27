App.Models.Travel = Backbone.Model.extend({
  url: function() {
    var base = App.config.api_url + '/travels';
    if (this.isNew()) return base;
    return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
  },
  confirm: function(options) {
    GoogleRequest.put({
      url: this.url() + '/confirm',
      success: function(){
        if (options.success) {options.success();}
      },
      error: function(){
        if (options.error) {options.error();}
      }
    });
  },
  bookmark: function(options) {
    GoogleRequest.put({
      url: this.url() + '/bookmark',
      success: function(){
        if (options.success) {options.success();}
      },
      error: function(){
        if (options.error) {options.error();}
      }
    });
  },
  locomotion: function(){
    if (this.get('provider') == 'ratp'){
      return 'public transportation';
    }
    else if (this.get('provider') == 'google-directions'){
      return 'car travel';
    }
  }
});

(function($){
  $.extend($, {
    escapeHTML: function(string){
      return $('<pre>').text(string).html();
    },
    truncate: function(string, length){
      omission = '...'
      if (string.length > length - omission.length){
        return string.substring(0, length) + omission;
      }
      else{
        return string;
      }
    },
    stripHTML: function(string){
      var matchTag = /<(?:.|\s)*?>/g;
      return string.replace(matchTag, "");
    }
  });
})(jQuery);

showTab = function(base, tab) {
  // Figure out current list via CSS class  
  var curList = base.$el.find("a.current").attr("href").substring(1);
  // List moving to
  $newList = $(tab),
  // Figure out ID of new list
  listID = $newList.attr("href").substring(1),    
  // Set outer wrapper height to (static) height of current inner list
  $allListWrap = base.$el.find(".list-wrap"),
  curListHeight = $allListWrap.height();
  $allListWrap.height(curListHeight);
                          
  if ((listID != curList) && (base.$el.find(":animated").length == 0)) {
    // Notify to delegator 
    base.options.delegate(base.$el, listID);                                
    // Fade out current list
    base.$el.find("#"+curList).fadeOut(base.options.speed, function() {                        
      // Fade in new list on callback
      base.$el.find("#"+listID).fadeIn(base.options.speed);                      
      // Adjust outer wrapper to fit new list snuggly
      var newHeight = base.$el.find("#"+listID).height();
      $allListWrap.animate({
        height: newHeight
      });                      
      // Remove highlighting - Add to just-clicked tab
      base.$el.find(".nav li a").removeClass("current");
      $newList.addClass("current");                            
    });                    
  }    
};

defaultOptions = {
  "speed": 100
};

(function($) {    
  $.organicTabs = function(el, options) {
    var base = this;
    base.$el = $(el);
    base.$nav = base.$el.find(".nav");              
    base.init = function() {        
      base.options = $.extend({}, defaultOptions, options);            
      // Accessible hiding fix
      $(".hide").css({
          "position": "relative",
          "top": 0,
          "left": 0,
          "display": "none"
      });             
      base.$nav.delegate("li > a", "click", function() {     
        // $.showTab(el, this, base.options);
        showTab(base, this);
        /*       
        // Figure out current list via CSS class
        var curList = base.$el.find("a.current").attr("href").substring(1),
        // List moving to
        $newList = $(this),
        // Figure out ID of new list
        listID = $newList.attr("href").substring(1),    
        // Set outer wrapper height to (static) height of current inner list
        $allListWrap = base.$el.find(".list-wrap"),
        curListHeight = $allListWrap.height();
        $allListWrap.height(curListHeight);
                                
        if ((listID != curList) && (base.$el.find(":animated").length == 0)) {
          // Notify to delegator 
          base.options.delegate(base.$el, listID);                                
          // Fade out current list
          base.$el.find("#"+curList).fadeOut(base.options.speed, function() {                        
            // Fade in new list on callback
            base.$el.find("#"+listID).fadeIn(base.options.speed);                      
            // Adjust outer wrapper to fit new list snuggly
            var newHeight = base.$el.find("#"+listID).height();
            $allListWrap.animate({
              height: newHeight
            });                      
            // Remove highlighting - Add to just-clicked tab
            base.$el.find(".nav li a").removeClass("current");
            $newList.addClass("current");                            
          });                    
        }   
        */
        // Don't behave like a regular link
        // Stop propegation and bubbling
        return false;
      });          
    };
    base.init();
  };
  /*
  $.showTab = function(el, tab, options) {
    var base = this;
    base.$el = $(el);
    base.$nav = base.$el.find(".nav");  
    base.options = options;
            
    // Figure out current list via CSS class    
    var curList = base.$el.find("a.current").attr("href").substring(1),
    // List moving to
    $newList = $(tab),
    // Figure out ID of new list
    listID = $newList.attr("href").substring(1),    
    // Set outer wrapper height to (static) height of current inner list
    $allListWrap = base.$el.find(".list-wrap"),
    curListHeight = $allListWrap.height();
    $allListWrap.height(curListHeight);
                            
    if ((listID != curList) && (base.$el.find(":animated").length == 0)) {
      // Notify to delegator 
      base.options.delegate(base.$el, listID);                                
      // Fade out current list
      base.$el.find("#"+curList).fadeOut(base.options.speed, function() {                        
        // Fade in new list on callback
        base.$el.find("#"+listID).fadeIn(base.options.speed);                      
        // Adjust outer wrapper to fit new list snuggly
        var newHeight = base.$el.find("#"+listID).height();
        $allListWrap.animate({
          height: newHeight
        });                      
        // Remove highlighting - Add to just-clicked tab
        base.$el.find(".nav li a").removeClass("current");
        $newList.addClass("current");                            
      });                    
    }    
  };
  */
  /*
  organicTabs.defaultOptions = {
    "speed": 100
  };
    */
  $.fn.organicTabs = function(options) {
    return this.each(function() {
      (new $.organicTabs(this, options));
    });
  };    
})(jQuery);

(function($) {  
  $.showTab = function(el, tab, options) {
    var base = this;
    base.$el = $(el);
    base.$nav = base.$el.find(".nav");
    base.options = $.extend({}, defaultOptions, options);
    showTab(base, tab);
  };
  
  $.fn.showTab = function(tab, options) {
    return this.each(function() {
      (new $.showTab(this, tab, options));
    });
  };
})(jQuery);
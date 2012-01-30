var timejust = {
  setCookie: function(k, v) {
    // We should use the domain under otherwise, we are going to get blocked
    // by safari default privacy cookie setting.
    $.cookie(k, v, { expires: 1, domain: '.googleusercontent.com', path: '/gadgets' });    
  },
  setLongtermCookie: function(k, v) {
    $.cookie(k, v, { expires: 10, domain: '.googleusercontent.com', path: '/gadgets' });    
  }  
};


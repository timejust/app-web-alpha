var alias = {
  isAlias: function(address) {
    return (address != null && address.length > 0 && address[0] == '@')
  },
  getAddressFromAlias: function(aliasList, title) {
    if (aliasList != null && aliasList.length > 0) {
      for (var i = 0; i < aliasList.length; ++i) {
        if (aliasList[i].title == title) {
          return aliasList[i];
        }
      }      
    }      
    return null;
  }
}
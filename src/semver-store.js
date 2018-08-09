var SemVerStore = require("semver-store");

SemVerStore.prototype.delete = function (version) {
    var count = 0;
    if (typeof version !== 'string') {
      throw new TypeError('Version should be a string')
    }
    var firstDot = version.indexOf('.')
    var secondDot = version.indexOf('.', firstDot + 1)
    var major = version.slice(0, firstDot)
    var minor = secondDot === -1
      ? version.slice(firstDot + 1)
      : version.slice(firstDot + 1, secondDot)
    var patch = secondDot === -1
      ? 'x'
      : version.slice(secondDot + 1)
  
    // check existence of major node
    var majorNode = this.tree.children[major]
    if (majorNode == null) return count;
  
    // if minor is the wildcard, then remove the full major node
    if (minor === 'x') {
      var childNode = this.tree.getChild(major);
      
      for( var i=0; i < childNode.childrenPrefixes.length; i++){
        var childPrefix = childNode.childrenPrefixes[i];
        count += childNode.getChild(childPrefix).childrenPrefixes.length;
      }
  
      this.tree.removeChild(major)
      return count;
    }
  
    // check existence of minor node
    var minorNode = majorNode.children[minor]
    if (minorNode == null) return count;
  
    // if patch is the wildcard, then remove the full minor node
    // and also the major if there are no more children
    if (patch === 'x') {
      var node = this.tree.children[major];
      count = node.getChild(minor).childrenPrefixes.length;
      node.removeChild(minor)
  
      if (node.length === 0) {
        this.tree.removeChild(major)
      }
      return count
    }
  
    // check existence of patch node
    var patchNode = minorNode.children[patch]
    if (patchNode == null) return count;
  
    // Specific delete
    this.tree
      .children[major]
      .children[minor]
      .removeChild(patch)
  
      count = 1;
  
    // check if the minor node has no more children, if so removes it
    // same for the major node
    if (this.tree.children[major].children[minor].length === 0) {
      this.tree.children[major].removeChild(minor)
      if (this.tree.children[major].length === 0) {
        this.tree.removeChild(major)
      }
    }
  
    return count;
  }

  SemVerStore.prototype.count = function () {
    var count = 0;
      
    for( var i=0; i < this.tree.childrenPrefixes.length; i++){
      var childNode = this.tree.getChild( this.tree.childrenPrefixes[i] );
      for( var j=0; j < childNode.childrenPrefixes.length; j++){
        var childPrefix = childNode.childrenPrefixes[j];
        count += childNode.getChild(childPrefix).childrenPrefixes.length;
      }
    }
  
    return count;
  }
  
  module.exports = SemVerStore;
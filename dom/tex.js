/*jslint browser: true */ /*globals require, exports */
var TeX = exports.TeX = function(children) {
  /** TeX represents a single TeX node

  children could be non-empty Strings or other TeX nodes
  */
  this.children = children || [];
};
TeX.prototype.push = function(child) {
  this.children.push(child);
};
TeX.prototype.toString = function() {
  /** Return a flattened string representation
  - no braced nesting
  - contains commands
  - and escapes
  */
  // in V8: [].join('') === '', which is convenient because we want '' for childless nodes
  return this.children.map(function(child) {
    return child.toString();
  }).join('');
};
TeX.prototype.toTeX = function(root) {
  /** Return a string representation, but:
  - Surround representation of children with braces ({...})
  - If root is true, do not surround the add external braces for the very first level.
  */
  var children_string = this.children.map(function(child) {
    return (child instanceof TeX) ? child.toTeX() : child.toString();
  }).join('');

  if (root) {
    return children_string;
  }
  return '{' + children_string + '}';
};
TeX.prototype.toJSON = function() {
  /** Return a tree structure represented as Arrays and Strings
  */
  return this.children.map(function(child) {
    return (child instanceof TeX) ? child.toJSON() : child.toString();
  });
};
TeX.prototype.normalize = function() {
  /**
  Return the nearest node with multiple children,
  or the leaf node if it's only-children all the way down,
  potentially this node.
  */
  if (this.children && this.children.length == 1) {
    var only_child = this.children[0];
    if (only_child.normalize) {
      return only_child.normalize();
    }
  }
  return this;
};

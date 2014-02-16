/*jslint node: true */
var _ = require('underscore');

var Stack = function(data) {
  /** Stack is mostly an impoverished Array wrapper,
  but with a .top helper */
  this.data = data || [];
  this.refresh();
};
Stack.prototype.push = function(item) {
  // unlike Array.push, return the pushed item
  this.data.push(item);
  this.refresh();
  return item;
};
Stack.prototype.pop = function() {
  // like Array.pop, return the popped item
  var item = this.data.pop();
  this.refresh();
  return item;
};
Stack.prototype.refresh = function() {
  // maybe these should be getters?
  this.length = this.data.length;
  this.root = this.data[0];
  this.top = this.data[this.data.length - 1];
};

var TeX = exports.TeX = function(children) {
  // children could be non-empty Strings or other TeX nodes
  this.children = children || [];
};
TeX.parse = function(string) {
  // in V8: ('' ? 'y' : 'n') == 'n'
  var stack = new Stack([new TeX()]);
  // console.log('TeX.parse:', string, stack.top);
  var buf = '';
  var flush = function() {
    if (buf) {
      stack.top.push(buf);
      buf = '';
    }
  };
  for (var i = 0, l = string.length; i < l; i++) {
    var c = string.charAt(i);
    if (c === '{') {
      flush();
      // push new node onto the stack
      // var next = ;
      // stack.top.push(next);
      stack.push(new TeX());
    }
    else if (c === '}') {
      flush();
      // in V8: ([] ? 'y' : 'n') == 'y'
      var child = stack.pop();
      if (stack.top) {
        stack.top.push(child);
      }
      else {
        console.error('Cannot append item to top of empty stack');
      }
    }
    else {
      buf += c;
    }
  }
  flush();
  // maybe throw an error if stack.length > 1 ?
  // otherwise, it will autoclose, i.e., add as many }'s
  // at the end as it needs to for it to make sense
  // is this default sane?
  return stack.root || new TeX();
};
TeX.prototype.push = function(child) {
  this.children.push(child);
};
TeX.prototype.toString = function() {
  return '{' + this.toNakedString() + '}';
};
TeX.prototype.toNakedString = function() {
  // in V8: [].join('') === '', which is convenient because we want {} for empty cases
  return this.children.map(function(child) {
    return child.toString();
  }).join('');
};
TeX.prototype.normalize = function() {
  // return the nearest node with multiple children,
  // or the leaf node if it's only-children all the way down,
  // potentially this node
  if (this.children && this.children.length == 1) {
    var only_child = this.children[0];
    if (only_child.normalize) {
      return only_child.normalize();
    }
  }
  return this;
};

var Reference = exports.Reference = function(type, key, tags) {
  /** Reference, a.k.a., BibTeX entry, is like a Citation but:
  * Also has a citation-key and,
  * Contains properties as a list instead of as a dictionary.

  I go with "Reference" because that's what http://en.wikipedia.org/wiki/BibTeX uses.
  */
  this.type = type; // 'pubtype'
  this.key = key; // 'citekey'
  this.tags = tags || []; // list of ReferenceTag objects. tags[i].value should be a TeX instance.
};
Reference.prototype.toBibTeX = function(opts) {
  // returns a formatted String
  opts = _.extend({}, {
    indent: '  ',
    newline: '\n'
  }, opts);

  var pre_lines = ['@' + this.type + '{' + this.key + ','];
  var tag_lines = this.tags.map(function(tag) {
    return opts.indent + tag.key + ' = ' + tag.value.toString() + ',';
  });
  var post_lines = ['}'];
  var lines = pre_lines.concat(tag_lines).concat(post_lines);
  return lines.join(opts.newline);
};
Reference.prototype.getTag = function(key) {
  /** Return the accompany stringified value for the tag with a key of "key", or null */
  for (var i = 0; i < this.tags.length; i++) {
    if (this.tags[i].key == key) {
      return this.tags[i].value;
    }
  }
  return null;
};
Reference.prototype.toString = function() {
  return this.toBibTeX();
};
Reference.prototype.addTag = function(key, value_string) {
  var value = TeX.parse(value_string).normalize();
  var tag = new ReferenceTag(key, value);
  this.tags.push(tag);
  return tag;
};
/*Reference.prototype.toJSON = function() {
  return {
    type: this.type,
    key: this.key,
    tags: this.tags,
  }
};*/

var ReferenceTag = exports.ReferenceTag = function(key, value) {
  this.key = key;
  this.value = value;
};

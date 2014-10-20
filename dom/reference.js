/*jslint browser: true */ /*globals require, exports */
// var TeX = require('./tex').TeX;
var tex = require('../tex');
var lib = require('../lib');

var ReferenceTag = exports.ReferenceTag = function(key, value) {
  this.key = key;
  this.value = value;
};

var Reference = exports.Reference = function(type, key, tags) {
  /** Reference, a.k.a., BibTeX entry, is like a Citation but:
  * Also has a citation-key and,
  * Contains properties as a list instead of as a dictionary.

  Valid tag keys:

    address
    annote
    author
    booktitle
    chapter
    crossref
    edition
    editor
    eprint
    howpublished
    institution
    journal
    key
    month
    note
    number
    organization
    pages
    publisher
    school
    series
    title
    type
    url
    volume
    year


  I go with "Reference" because that's what http://en.wikipedia.org/wiki/BibTeX uses.
  The list of keys above is also from the BibTeX page on Wikipedia.
  */
  this.type = type; // 'pubtype'
  this.key = key; // 'citekey'
  this.tags = tags || []; // list of ReferenceTag objects. tags[i].value should be a TeX instance.
};
Reference.prototype.addTag = function(key, value_string) {
  var value = tex.parse(value_string).normalize();
  var tag = new ReferenceTag(key, value);
  this.tags.push(tag);
  return tag;
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
Reference.prototype.toBibTeX = function(opts) {
  /** Return a String of formatted BibTeX
  */
  opts = lib.extend({indent: '  ', newline: '\n'}, opts);

  var pre_lines = ['@' + this.type + '{' + this.key + ','];
  var tag_lines = this.tags.map(function(tag) {
    return opts.indent + tag.key + ' = ' + tag.value.toTeX() + ',';
  });
  var post_lines = ['}'];
  var lines = pre_lines.concat(tag_lines).concat(post_lines);
  return lines.join(opts.newline);
};
Reference.prototype.toString = function() {
  /** Return the BibTeX representation with default formatting */
  return this.toBibTeX();
};
Reference.prototype.toJSON = function() {
  /** Return a simple JavaScript object representing this Reference,
  "simple", meaning a mapping from
  */
  var obj = {
    _type: this.type,
    _key: this.key,
  };
  for (var i = 0, tag; (tag = this.tags[i]); i++) {
    // we want to preserve the TeX inside the value
    obj[tag.key] = tag.value.toTeX(true);
  }
  return obj;
};

/// <reference path="type_declarations/index.d.ts" />
var lexing = require('lexing');
var states = require('./states');
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

http://en.wikipedia.org/wiki/BibTeX uses "Reference" and "Entry" apparently
interchangeably, but I think "Reference" is more descriptive.

The list of keys above is also from the BibTeX page on Wikipedia.
*/
var Reference = (function () {
    function Reference(pubtype, citekey, fields) {
        if (fields === void 0) { fields = {}; }
        this.pubtype = pubtype;
        this.citekey = citekey;
        this.fields = fields;
    }
    Reference.prototype.toBibTeX = function (indent, newline) {
        var _this = this;
        if (indent === void 0) { indent = '  '; }
        if (newline === void 0) { newline = '\n'; }
        var keys = Object.keys(this.fields);
        var tag_lines = keys.map(function (key) { return ("" + indent + key + " = {" + _this.fields[key] + "},"); });
        return "@" + this.pubtype + "{" + this.citekey + "," + newline + tag_lines.join(newline) + newline + "}";
    };
    Reference.prototype.toJSON = function () {
        var obj = { pubtype: this.pubtype, citekey: this.citekey };
        for (var key in this.fields) {
            obj[key] = this.fields[key];
        }
        return obj;
    };
    return Reference;
})();
exports.Reference = Reference;
function parseReference(string) {
    var string_iterable = new lexing.StringIterator(string);
    var referenceValue = new states.BIBFILE_FIRST(string_iterable).read();
    return new Reference(referenceValue.pubtype, referenceValue.citekey, referenceValue.fields);
}
exports.parseReference = parseReference;
function parseReferences(string) {
    var string_iterable = new lexing.StringIterator(string);
    var referencesValue = new states.BIBFILE(string_iterable).read();
    return referencesValue.map(function (referenceValue) {
        return new Reference(referenceValue.pubtype, referenceValue.citekey, referenceValue.fields);
    });
}
exports.parseReferences = parseReferences;
if (require.main == module) {
    var streaming = require('streaming');
    streaming.readToEnd(process.stdin, function (err, chunks) {
        if (err)
            throw err;
        var string = Buffer.concat(chunks).toString('utf8');
        var references = parseReference(string);
        console.log('%j', references);
    });
}

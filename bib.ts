/// <reference path="type_declarations/index.d.ts" />
import lexing = require('lexing');
import states = require('./states');

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
class Reference {
  constructor(public pubtype: string,
              public citekey: string,
              public fields: {[index: string]: string} = {}) { }

  toBibTeX(indent: string = '  ', newline: string = '\n'): string {
    var keys = Object.keys(this.fields);
    var tag_lines = keys.map(key => `${indent}${key} = ${this.fields[key]},`);
    return `@${this.pubtype}{${this.citekey},${newline}${tag_lines.join(newline)}${newline}}`;
  }

  toJSON() {
    var obj = { pubtype: this.pubtype, citekey: this.citekey };
    for (var key in this.fields) {
      obj[key] = this.fields[key];
    }
    return obj;
  }
}

export function parseReference(string: string): Reference {
  var string_iterable = new lexing.StringIterator(string);
  var referenceValue = new states.REFERENCE(string_iterable).read();
  return new Reference(referenceValue.pubtype, referenceValue.citekey, referenceValue.fields);
}

export function parseReferences(string: string): Reference[] {
  var string_iterable = new lexing.StringIterator(string);
  var referencesValue = new states.BIBFILE(string_iterable).read();
  return referencesValue.map(referenceValue =>
    new Reference(referenceValue.pubtype, referenceValue.citekey, referenceValue.fields))
}

if (require.main == module) {
  var streaming = require('streaming');
  streaming.readToEnd(process.stdin, (err, chunks) => {
    if (err) throw err;

    var string = Buffer.concat(chunks).toString('utf8');
    var references = parseReferences(string);
    console.log('%j', references);
  });
}

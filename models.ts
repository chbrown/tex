/**
Reference is a flat representation of a BibTeXEntry; it does not retain
information about the order of the fields, so it is not suitable for
reconstruction of the original BibTeX file, but sufficient for being used
downstream.

The list of field types comes from Wikipedia, which I figure is as good a
reference as any (https://en.wikipedia.org/wiki/BibTeX#Field_types), to which
I've also added 'eprint' and 'url'.
*/
export interface Reference {
  // required:
  pubtype: string;
  citekey: string;
  // optional field types:
  address?: string;
  annote?: string;
  author?: string;
  booktitle?: string;
  chapter?: string;
  crossref?: string;
  edition?: string;
  editor?: string;
  eprint?: string;
  howpublished?: string;
  institution?: string;
  journal?: string;
  key?: string;
  month?: string;
  note?: string;
  number?: string;
  organization?: string;
  pages?: string;
  publisher?: string;
  school?: string;
  series?: string;
  title?: string;
  type?: string;
  url?: string;
  volume?: string;
  year?: string;
}

/**
BibTeXEntry is a more faithful representation of an individual entry from a
BibTeX file than is Reference, mostly because it lists the fields as a list
instead of as a dictionary.

The valid values for the keys of `fields` are the optional properties from
`Reference`.
*/
export class BibTeXEntry {
  constructor(public pubtype: string,
              public citekey: string,
              public fields: {[index: string]: string} = {}) { }

  toBibTeX(indent: string = '  ', newline: string = '\n'): string {
    var keys = Object.keys(this.fields);
    var tag_lines = keys.map(key => `${indent}${key} = {${this.fields[key]}},`);
    return `@${this.pubtype}{${this.citekey},${newline}${tag_lines.join(newline)}${newline}}`;
  }

  toJSON(): Reference {
    var object: Reference = {
      pubtype: this.pubtype,
      citekey: this.citekey,
    };
    for (var key in this.fields) {
      object[key] = this.fields[key];
    }
    return object;
  }

  static fromJSON(object: Reference): BibTeXEntry {
    var pubtype = object.pubtype;
    var citekey = object.citekey;
    var fields: {[index: string]: string} = {};
    for (var key in object) {
      if (object.hasOwnProperty(key) && key != 'pubtype' && key != 'citekey') {
        fields[key] = object[key];
      }
    }
    return new BibTeXEntry(pubtype, citekey, fields);
  }
}

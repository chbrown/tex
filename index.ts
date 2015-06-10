/// <reference path="type_declarations/index.d.ts" />
import lexing = require('lexing');

import states = require('./states');
import dom = require('./dom');
import models = require('./models');

export var BibTeXEntry = models.BibTeXEntry;

export function parseBibTeXEntry(string: string): models.BibTeXEntry {
  var string_iterable = new lexing.StringIterator(string);
  return new states.BIBFILE_FIRST(string_iterable, 1024).read();
}

export function parseBibTeXEntries(string: string): models.BibTeXEntry[] {
  var string_iterable = new lexing.StringIterator(string);
  return new states.BIBFILE(string_iterable, 1024).read();
}

export function parseNode(string: string): dom.ParentNode {
  var string_iterable = new lexing.StringIterator(string);
  // skip over the initial {
  string_iterable.skip(1);
  return new states.TEX(string_iterable).read();
}

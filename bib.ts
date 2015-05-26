/// <reference path="type_declarations/index.d.ts" />
import lexing = require('lexing');
import states = require('./states');

import * as dom from './dom';

export function parseReference(string: string): dom.Reference {
  var string_iterable = new lexing.StringIterator(string);
  return new states.BIBFILE_FIRST(string_iterable, 1024).read();
}

export function parseReferences(string: string): dom.Reference[] {
  var string_iterable = new lexing.StringIterator(string);
  return new states.BIBFILE(string_iterable, 1024).read();
}

export var Reference = dom.Reference;

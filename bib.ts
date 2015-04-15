/// <reference path="type_declarations/index.d.ts" />
import lexing = require('lexing');
import states = require('./states');

import {Reference} from './dom';

export function parseReference(string: string): Reference {
  var string_iterable = new lexing.StringIterator(string);
  return new states.BIBFILE_FIRST(string_iterable).read();
}

export function parseReferences(string: string): Reference[] {
  var string_iterable = new lexing.StringIterator(string);
  return new states.BIBFILE(string_iterable).read();
}

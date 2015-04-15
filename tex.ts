/// <reference path="type_declarations/index.d.ts" />
import lexing = require('lexing');
import states = require('./states');

import {TextNode, ParentNode, MacroNode} from './dom';

export function parseNode(string: string): ParentNode {
  var string_iterable = new lexing.StringIterator(string);
  // skip over the initial {
  string_iterable.skip(1);
  return new states.TEX(string_iterable).read();
}

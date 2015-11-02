import {StringIterator} from 'lexing';

import {ParentNode} from './dom';
import {BibTeXEntry} from './models';
import {BIBFILE_FIRST, BIBFILE, TEX} from './states';

export function parseBibTeXEntry(string: string): BibTeXEntry {
  var string_iterable = new StringIterator(string);
  return new BIBFILE_FIRST(string_iterable, 1024).read();
}

export function parseBibTeXEntries(string: string): BibTeXEntry[] {
  var string_iterable = new StringIterator(string);
  return new BIBFILE(string_iterable, 1024).read();
}

export function parseNode(tex: string): ParentNode {
  var string_iterable = new StringIterator(tex);
  // skip over the initial {
  string_iterable.skip(1);
  return new TEX(string_iterable).read();
}

export function extractCitekeys(tex: string): string[] {
  var citekeys = [];
  // super-simple regular expression solution (doesn't detect commented-out citations)
  var cite_regexp = /\\\w*cite\w*\{([^}]+)\}/g;
  var match: RegExpExecArray;
  while ((match = cite_regexp.exec(tex)) !== null) {
    var match_citekeys = match[1].split(',');
    Array.prototype.push.apply(citekeys, match_citekeys);
  }
  return citekeys;
}

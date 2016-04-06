import {StringIterator} from 'lexing';

import {ParentNode} from './dom';
import {BibTeXEntry} from './models';
import {BIBFILE_FIRST, BIBFILE, TEX} from './states';

export function parseBibTeXEntry(string: string): BibTeXEntry {
  const string_iterable = new StringIterator(string);
  return new BIBFILE_FIRST(string_iterable, 1024).read();
}

export function parseBibTeXEntries(string: string): BibTeXEntry[] {
  const string_iterable = new StringIterator(string);
  return new BIBFILE(string_iterable, 1024).read();
}

export function parseNode(tex: string): ParentNode {
  const string_iterable = new StringIterator(tex);
  // skip over the initial {
  string_iterable.skip(1);
  return new TEX(string_iterable).read();
}

export function extractCitekeys(tex: string): string[] {
  const citekeys = [];
  // super-simple regular expression solution (doesn't detect commented-out citations)
  const cite_regexp = /\\\w*cite\w*\{([^}]+)\}/g;
  let match: RegExpExecArray;
  while ((match = cite_regexp.exec(tex)) !== null) {
    const match_citekeys = match[1].split(',');
    Array.prototype.push.apply(citekeys, match_citekeys);
  }
  return citekeys;
}

export function stringifyBibTeXEntry(bibTeXEntry: BibTeXEntry,
                                     indent: string = '  ',
                                     newline: string = '\n'): string {
  const fieldLines = bibTeXEntry.fields.map(([name, value]) => `${indent}${name} = {${value}},`);
  return `@${bibTeXEntry.pubtype}{${bibTeXEntry.citekey},${newline}${fieldLines.join(newline)}${newline}}`;
}

export function flattenBibTeXEntry(bibTeXEntry: BibTeXEntry): {[index: string]: string} {
  const {pubtype, citekey, fields} = bibTeXEntry;
  const object: {[index: string]: string} = {pubtype, citekey};
  fields.forEach(([name, value]) => object[name] = value);
  return object;
}

export function unflattenBibTeXEntry(object: {[index: string]: string}): BibTeXEntry {
  const {pubtype, citekey} = object;
  const fields: [string, string][] = [];
  Object.keys(object).filter(key => key != 'pubtype' && key != 'citekey').forEach(key => {
    fields.push([key, object[key]]);
  });
  return {pubtype, citekey, fields};
}

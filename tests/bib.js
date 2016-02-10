import assert from 'assert';
import {describe, it} from 'mocha';
import {readdirSync, readFileSync} from 'fs';
import {join} from 'path';
import {nfc} from 'unorm';

import {parseBibTeXEntry, flattenBibTeXEntry} from '../';

function normalizeObject(object) {
  for (var key in object) {
    object[key] = nfc(object[key]);
  }
  return object;
}

function compareBibJson(bibPath, jsonPath = bibPath.replace(/bib$/, 'json')) {
  it(`should parse ${bibPath} into ${jsonPath}`, () => {
    const actual_data = readFileSync(bibPath, {encoding: 'utf8'});
    const actualBibTeXEntry = parseBibTeXEntry(actual_data);
    assert(actualBibTeXEntry, 'parse result is empty');
    const actualReference = normalizeObject(flattenBibTeXEntry(actualBibTeXEntry));
    const expectedReference = normalizeObject(JSON.parse(readFileSync(jsonPath, {encoding: 'utf8'})));
    assert.deepEqual(actualReference, expectedReference);
  });
}

describe('BibTeX parser', () => {
  const dirpath = join(__dirname, 'bibfiles');
  readdirSync(dirpath)
  .filter(file => file.match(/bib$/) != null)
  .forEach(filename => {
    compareBibJson(join(dirpath, filename));
  });
});

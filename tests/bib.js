import assert from 'assert';
import {describe, it} from 'mocha';
import {readdirSync, readFileSync} from 'fs';
import {join} from 'path';
import {nfc} from 'unorm';

import {parseBibTeXEntry} from '../';

function normalizeObject(object) {
  for (var key in object) {
    object[key] = nfc(object[key]);
  }
  return object;
}

describe('BibTeX parser', () => {
  var dirpath = join(__dirname, 'bibfiles');
  var filenames = readdirSync(dirpath).filter(file => file.match(/bib$/) != null);
  filenames.forEach(filename => {
    var bib_filepath = join(dirpath, filename);
    var json_filepath = bib_filepath.replace(/bib$/, 'json');
    it(`should parse ${bib_filepath} into ${json_filepath}`, () => {
      var actual_data = readFileSync(bib_filepath, {encoding: 'utf8'});
      var actual_bibtex_entry = parseBibTeXEntry(actual_data);
      assert(actual_bibtex_entry, 'parse result is empty');
      var actual = normalizeObject(actual_bibtex_entry.toJSON());
      var expected = normalizeObject(JSON.parse(readFileSync(json_filepath, {encoding: 'utf8'})));
      assert.deepEqual(actual, expected);
    });
  });
});

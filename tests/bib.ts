import fs = require('fs');
import path = require('path');
import assert = require('assert');
import unorm = require('unorm');

import tex = require('../index');

function normalizeObject(object: any) {
  for (var key in object) {
    object[key] = unorm.nfc(object[key]);
  }
  return object;
}

describe('BibTeX parser', () => {
  var dirpath = path.join(__dirname, 'bibfiles');
  var filenames = fs.readdirSync(dirpath).filter(file => file.match(/bib$/) != null);
  filenames.forEach(filename => {
    var bib_filepath = path.join(dirpath, filename);
    var json_filepath = bib_filepath.replace(/bib$/, 'json');
    it(`should parse ${bib_filepath} into ${json_filepath}`, () => {
      var actual_data = fs.readFileSync(bib_filepath, {encoding: 'utf8'});
      var actual_bibtex_entry = tex.parseBibTeXEntry(actual_data);
      assert(actual_bibtex_entry, 'parse result is empty');
      var actual = normalizeObject(actual_bibtex_entry.toJSON());
      var expected = normalizeObject(JSON.parse(fs.readFileSync(json_filepath, {encoding: 'utf8'})));
      assert.deepEqual(actual, expected);
    });
  })
});

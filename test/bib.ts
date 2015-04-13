/// <reference path="../type_declarations/index.d.ts" />
import fs = require('fs');
import path = require('path');
import assert = require('assert');

import bib = require('../bib');

describe('BibTeX parser', () => {

  var dirpath = path.join(__dirname, 'bibfiles');
  var filenames = fs.readdirSync(dirpath).filter(file => file.match(/bib$/) != null);
  filenames.forEach(filename => {
    var bib_filepath = path.join(dirpath, filename);
    var json_filepath = bib_filepath.replace(/bib$/, 'json');
    it(`should parse ${bib_filepath} into ${json_filepath}`, () => {
      var input = fs.readFileSync(bib_filepath, {encoding: 'utf8'});
      var output = bib.parseReference(input).toJSON();
      var expected_output = JSON.parse(fs.readFileSync(json_filepath, {encoding: 'utf8'}));
      assert.deepEqual(output, expected_output, `parse result does not match expected output.
        "${input}"
        when parsed => ${JSON.stringify(output)}
        but should  == ${JSON.stringify(expected_output)}`);
    });
  })

});

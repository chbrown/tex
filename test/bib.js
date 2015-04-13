/// <reference path="../type_declarations/index.d.ts" />
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var bib = require('../bib');
describe('BibTeX parser', function () {
    var dirpath = path.join(__dirname, 'bibfiles');
    var filenames = fs.readdirSync(dirpath).filter(function (file) { return file.match(/bib$/) != null; });
    filenames.forEach(function (filename) {
        var bib_filepath = path.join(dirpath, filename);
        var json_filepath = bib_filepath.replace(/bib$/, 'json');
        it("should parse " + bib_filepath + " into " + json_filepath, function () {
            var input = fs.readFileSync(bib_filepath, { encoding: 'utf8' });
            var output = bib.parseReference(input).toJSON();
            var expected_output = JSON.parse(fs.readFileSync(json_filepath, { encoding: 'utf8' }));
            assert.deepEqual(output, expected_output, "parse result does not match expected output.\n        \"" + input + "\"\n        when parsed => " + JSON.stringify(output) + "\n        but should  == " + JSON.stringify(expected_output));
        });
    });
});

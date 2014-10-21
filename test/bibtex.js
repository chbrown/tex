/*jslint node: true, multistr: true */ /*globals describe, it */
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var logger = require('loge');
var yaml = require('js-yaml');

var bibtex = require('../bibtex');

logger.level = process.env.DEBUG ? 'VERBOSE' : 'INFO';

var bibtex_yaml = fs.readFileSync(path.join(__dirname, 'bibtex.yaml'));
var spec = yaml.load(bibtex_yaml);

describe('BibTeX spec', function() {
  spec.forEach(function(item, i) {
    // each spec item has .input, .canonical, and .reference fields
    it('Spec item #' + i + ' should parse and render back to the original', function(done) {
      // call like `DEBUG=1 mocha test` to show the debug logs
      logger.debug('input: %s', item.input);
      logger.debug('canonical: %s', item.canonical);
      logger.debug('reference: %j', item.reference);
      bibtex.parse(item.input, function(err, references) {
        if (err) return done(err);

        var reference = references[0];

        // logger.debug('output bibtex: %s', reference.toBibTeX());
        // logger.debug('output reference: %s', JSON.stringify(reference, null, '  '));

        assert.equal(reference.toBibTeX(), item.canonical);
        assert.deepEqual(reference.toJSON(), item.reference); // (actual, expected)
        done();
      });
    });
  });
});

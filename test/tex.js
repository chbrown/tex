/*jslint node: true, multistr: true */ /*globals describe, it */
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var logger = require('loge');
var yaml = require('js-yaml');

var tex = require('../tex');

logger.level = process.env.DEBUG ? 'VERBOSE' : 'INFO';

describe('Specification yaml', function() {
  it('should load spec.yaml', function(done) {
    fs.readFile(path.join(__dirname, 'tex.yaml'), {encoding: 'utf8'}, function(err, data) {
      if (err) done(err);

      var spec = yaml.load(data);

      describe('Specification items', function() {
        spec.forEach(function(item, i) {
          it('spec item #' + i + ' should parse and render back to the original', function() {
            var tree = tex.parse(item.tex);
            var tree_tex = tree.toTeX(true);

            // call like `DEBUG=1 mocha test` to show the verbose logs
            logger.debug('input: %s', item.tex);
            logger.debug('output: %s', tree_tex);
            logger.debug('json : %j', tree);

            // assert.equal(actual, expected)
            assert.equal(tree_tex, item.tex);
            // TODO: also compare to JSON
          });
        });

      });

      done();
    });
  });
});

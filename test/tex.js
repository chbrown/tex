/*jslint node: true, multistr: true */ /*globals describe, it */
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var logger = require('loge');
var yaml = require('js-yaml');

var tex = require('../tex');

logger.level = process.env.DEBUG ? 'VERBOSE' : 'INFO';

var tex_yaml = fs.readFileSync(path.join(__dirname, 'tex.yaml'));
var spec = yaml.load(tex_yaml);

describe('TeX spec', function() {
  spec.forEach(function(item, i) {
    it('Spec item #' + i + ' should parse and render back to the original', function() {
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

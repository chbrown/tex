/*jslint node: true */
var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var logger = require('loge');

var lexer = require('./lexer');
var Reference = require('./dom/reference').Reference;

var machines_yaml = fs.readFileSync(path.join(__dirname, 'machines.yaml'), {encoding: 'utf8'});
var machines = yaml.load(machines_yaml);

var parse = exports.parse = function(string, callback) {
  /** parse a string of bibtex references into a list of Reference() objects

  string: String
  callback: function(err, references)

  */
  var references = [];
  var current = new Reference();
  var current_tag = {value: ''};

  var errors = 0;
  var tolerance = 10;

  // this lexer doesn't use require('./tex').parse() functionality
  var bibtex_lexer = new lexer.Lexer.fromString(machines.bibtex.trim(), 'outside');
  // attach events before feeding it any input
  bibtex_lexer
  .on('error', function(err) {
    errors++;
    logger.error('LEXER ERROR', err);
    if (errors > tolerance) {
      // todo: abort lexer
      callback(new Error('Encountered too many parsing errors'));
    }
  })
  .on('data', function(states, body) {
    // console.log('data', states, body);

    var inside_state = states[1];
    if (states.length === 0 && current.type) {
      // flush current
      references.push(current);
      current = new Reference();
    }
    else if (inside_state == 'pubtype') {
      current.type = body.trim();
    }
    else if (inside_state == 'citekey') {
      current.key = body.trim();
    }
    else if (inside_state == 'field') {
      current_tag.key = body;
    }
    else if (inside_state == 'value') {
      current_tag.value += body;
    }
    else if (states.length === 1 && current_tag.key) {
      // flush current_tag
      current.addTag(current_tag.key, current_tag.value);
      current_tag = {value: ''};
    }
    else {
      // console.log('OTHER %j=%j', states, body);
    }
  })
  .on('end', function() {
    // flush current (maybe also current_tag?)
    if (current.type) {
      references.push(current);
    }

    callback(null, references);
  });

  bibtex_lexer.feedString(string);
};

/*jslint node: true */
var fs = require('fs');
var yaml = require('js-yaml');
var lexer = require('./lexer');
var dom = require('./dom');

var getMachines = function(callback) {
  /** call `callback(err, machines)` when we're ready */
  fs.readFile('machines.yaml', {encoding: 'utf8'}, function(err, data) {
    if (err) return callback(err);
    var machines = yaml.load(data);

    callback(null, machines);
  });
};

var parse = exports.parse = function(string, callback) {
  /** parse a string of bibtex entries into a list of Entry() objects

  string: String
  callback: function(err, entries)

  */
  // bibtex_lexer.attachConsole();
  var entries = [];
  var current = new dom.Reference();
  var current_tag = {value: ''};

  var errors = 0;
  var tolerance = 10;

  getMachines(function(err, machines) {
    if (err) return callback(err);

    console.log('Using bibtex machine:\n\n' + machines.bibtex);
    var bibtex_lexer = new lexer.Lexer.fromString(machines.bibtex.trim(), 'outside');
    bibtex_lexer
      .on('error', function(err) {
        errors++;
        console.log('ERROR', err);
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
          entries.push(current);
          current = new dom.Reference();
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
          entries.push(current);
        }

        callback(null, entries);
      });

    bibtex_lexer.feedString(string);
  });
};

if (require.main === module) {
  var streaming = require('streaming');
  process.stdin.setEncoding('utf8');
  streaming.readToEnd(process.stdin, function(err, chunks) {
    var data = chunks.join('');
    parse(data, function(err, entries) {
      if (err) throw err;
      // console.log('Done', err, entries);

      entries.forEach(function(entry) {
        console.log('');
        console.log(entry.toString());
      });
      // res.json(entries);

    });
  });
}


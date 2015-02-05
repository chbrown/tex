/*jslint node: true */
var streaming = require('streaming');
// var _ = require('underscore');
var bibtex = require('../../bibtex');

var fs = require('fs');
function findKeys(tex_filepath, callback) {
  fs.readFile(tex_filepath, {encoding: 'utf8'}, function(err, string) {
    if (err) return callback(err);

    var keys = [];

    var cite_command_regex = /\\\w*cite\w*\{\s*(.+?)\s*\}/g;
    var m;
    while ((m = cite_command_regex.exec(string))) {
      var cite_command_keys = m[1].split(/\s*,\s*/);
      Array.prototype.push.apply(keys, cite_command_keys);
    }

    return callback(null, keys);
  });
}

var main = function(argv, callback) {
  var printReference = function(reference) {
    var line = argv.json ? JSON.stringify(reference) : reference.toBibTeX();
    console.log(line);
  };

  streaming.readToEnd(process.stdin, function(err, chunks) {
    var data = Buffer.concat(chunks).toString('utf8');
    bibtex.parse(data, function(err, references) {
      if (err) return callback(err);

      if (argv.tex) {
        findKeys(argv.tex, function(err, keys) {
          if (err) return callback(err);

          references = references.filter(function(reference) {
            return keys.indexOf(reference.key) > -1;
          });

          references.forEach(printReference);
        });
      }
      else {
        references.forEach(printReference);
      }
    });
  });
};

module.exports = function(argv) {
  main(argv, function(err) {
    if (err) throw err;
    process.exit(0);
  });
};

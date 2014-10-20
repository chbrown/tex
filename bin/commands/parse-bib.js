#!/usr/bin/env node
/*jslint node: true */
var streaming = require('streaming');
var bibtex = require('../../bibtex');

module.exports = function(argv) {
  streaming.readToEnd(process.stdin, function(err, chunks) {
    var data = Buffer.concat(chunks).toString('utf8');
    bibtex.parse(data, function(err, references) {
      if (err) throw err;

      references.forEach(function(entry) {
        if (argv.json) {
          var json_string = JSON.stringify(entry);
          console.log(json_string);
        }
        else {
          var tex_string = entry.toBibTeX();
          console.log(tex_string + '\n');
        }
      });
    });
  });
};

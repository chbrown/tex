/// <reference path="type_declarations/index.d.ts" />
var lexing = require('lexing');
var states = require('./states');
var models = require('./models');
exports.BibTeXEntry = models.BibTeXEntry;
function parseBibTeXEntry(string) {
    var string_iterable = new lexing.StringIterator(string);
    return new states.BIBFILE_FIRST(string_iterable, 1024).read();
}
exports.parseBibTeXEntry = parseBibTeXEntry;
function parseBibTeXEntries(string) {
    var string_iterable = new lexing.StringIterator(string);
    return new states.BIBFILE(string_iterable, 1024).read();
}
exports.parseBibTeXEntries = parseBibTeXEntries;
function parseNode(string) {
    var string_iterable = new lexing.StringIterator(string);
    // skip over the initial {
    string_iterable.skip(1);
    return new states.TEX(string_iterable).read();
}
exports.parseNode = parseNode;

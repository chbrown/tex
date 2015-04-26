/// <reference path="type_declarations/index.d.ts" />
var lexing = require('lexing');
var states = require('./states');
var dom = require('./dom');
function parseReference(string) {
    var string_iterable = new lexing.StringIterator(string);
    return new states.BIBFILE_FIRST(string_iterable).read();
}
exports.parseReference = parseReference;
function parseReferences(string) {
    var string_iterable = new lexing.StringIterator(string);
    return new states.BIBFILE(string_iterable).read();
}
exports.parseReferences = parseReferences;
exports.Reference = dom.Reference;

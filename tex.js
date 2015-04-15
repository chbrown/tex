/// <reference path="type_declarations/index.d.ts" />
var lexing = require('lexing');
var states = require('./states');
function parseNode(string) {
    var string_iterable = new lexing.StringIterator(string);
    // skip over the initial {
    string_iterable.skip(1);
    return new states.TEX(string_iterable).read();
}
exports.parseNode = parseNode;

/**
BibTeXEntry is a more faithful representation of an individual entry from a
BibTeX file than is Reference, mostly because it lists the fields as a list
instead of as a dictionary.

The valid values for the keys of `fields` are the optional properties from
`Reference`.
*/
var BibTeXEntry = (function () {
    function BibTeXEntry(pubtype, citekey, fields) {
        if (fields === void 0) { fields = {}; }
        this.pubtype = pubtype;
        this.citekey = citekey;
        this.fields = fields;
    }
    BibTeXEntry.prototype.toBibTeX = function (indent, newline) {
        var _this = this;
        if (indent === void 0) { indent = '  '; }
        if (newline === void 0) { newline = '\n'; }
        var keys = Object.keys(this.fields);
        var tag_lines = keys.map(function (key) { return ("" + indent + key + " = {" + _this.fields[key] + "},"); });
        return "@" + this.pubtype + "{" + this.citekey + "," + newline + tag_lines.join(newline) + newline + "}";
    };
    BibTeXEntry.prototype.toJSON = function () {
        var object = {
            pubtype: this.pubtype,
            citekey: this.citekey,
        };
        for (var key in this.fields) {
            object[key] = this.fields[key];
        }
        return object;
    };
    BibTeXEntry.fromJSON = function (object) {
        var pubtype = object.pubtype;
        var citekey = object.citekey;
        var fields = {};
        for (var key in object) {
            if (object.hasOwnProperty(key) && key != 'pubtype' && key != 'citekey') {
                fields[key] = object[key];
            }
        }
        return new BibTeXEntry(pubtype, citekey, fields);
    };
    return BibTeXEntry;
})();
exports.BibTeXEntry = BibTeXEntry;

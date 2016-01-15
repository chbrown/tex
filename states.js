var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lexing_1 = require('lexing');
var models_1 = require('./models');
var dom_1 = require('./dom');
// all the classes below extend the MachineState base class,
// and are roughly in order of inheritance / usage
/**
This state is triggered by an opening brace, {, and should return when it hits
the matching closing brace, }.

TeX's special characters:

    # $ % & \ ^ _ { }

Except \^ is a valid command, for circumflex accents.
*/
var TEX = (function (_super) {
    __extends(TEX, _super);
    function TEX() {
        _super.apply(this, arguments);
        this.value = new dom_1.ParentNode();
        this.rules = [
            lexing_1.MachineRule(/^\\([#$%&\\_{} ])/, this.captureText),
            lexing_1.MachineRule(/^\\([`'^"~=.@-]|[A-Za-z]+)/, this.captureMacro),
            lexing_1.MachineRule(/^\{/, this.captureParent),
            lexing_1.MachineRule(/^\}/, this.pop),
            lexing_1.MachineRule(/^([^\\{}]+)/, this.captureText),
        ];
    }
    TEX.prototype.pop = function () {
        // combine macros with their children, if any
        // is there a better way / place to do this?
        var children = this.value.children;
        for (var i = 0, node; (node = children[i]); i++) {
            if (node instanceof dom_1.MacroNode) {
                var nextNode = children[i + 1];
                if (nextNode instanceof dom_1.ParentNode) {
                    node.children = nextNode.children;
                    // dispose of the next child
                    children.splice(i + 1, 1);
                }
                else if (nextNode instanceof dom_1.TextNode) {
                    node.children = [new dom_1.TextNode(nextNode.value[0])];
                    nextNode.value = nextNode.value.slice(1);
                }
            }
        }
        return this.value;
    };
    TEX.prototype.captureText = function (matchValue) {
        var textNode = new dom_1.TextNode(matchValue[1]);
        this.value.children.push(textNode);
        return undefined;
    };
    TEX.prototype.captureMacro = function (matchValue) {
        var macroNode = new dom_1.MacroNode(matchValue[1], []);
        this.value.children.push(macroNode);
        return undefined;
    };
    TEX.prototype.captureParent = function () {
        var parentNode = this.attachState(TEX).read();
        this.value.children.push(parentNode);
        return undefined;
    };
    return TEX;
})(lexing_1.MachineState);
exports.TEX = TEX;
var StringCaptureState = (function (_super) {
    __extends(StringCaptureState, _super);
    function StringCaptureState() {
        _super.apply(this, arguments);
        this.value = [];
    }
    StringCaptureState.prototype.captureMatch = function (matchValue) {
        this.value.push(matchValue[0]);
        return undefined;
    };
    return StringCaptureState;
})(lexing_1.MachineState);
exports.StringCaptureState = StringCaptureState;
var STRING = (function (_super) {
    __extends(STRING, _super);
    function STRING() {
        _super.apply(this, arguments);
        this.rules = [
            lexing_1.MachineRule(/^\\"/, this.captureMatch),
            lexing_1.MachineRule(/^"/, this.pop),
            lexing_1.MachineRule(/^(.|\r|\n)/, this.captureMatch),
        ];
    }
    STRING.prototype.pop = function () {
        return this.value.join('');
    };
    return STRING;
})(StringCaptureState);
exports.STRING = STRING;
/**
This state consumes a contiguous string of anything but whitespace and commas.
*/
var LITERAL = (function (_super) {
    __extends(LITERAL, _super);
    function LITERAL() {
        _super.apply(this, arguments);
        this.rules = [
            lexing_1.MachineRule(/^[^,\s]+/, this.captureMatch),
            lexing_1.MachineRule(/^/, this.pop),
        ];
    }
    return LITERAL;
})(STRING);
exports.LITERAL = LITERAL;
function createInterpolator(value) {
    return {
        toString: function (stringVariables) {
            return value.replace(/\$(\w+)/g, function (match, group1) { return stringVariables[group1]; });
        },
    };
}
var FIELD_VALUE = (function (_super) {
    __extends(FIELD_VALUE, _super);
    function FIELD_VALUE() {
        _super.apply(this, arguments);
        // this is a pass-through state, so no need to initialize anything
        this.rules = [
            lexing_1.MachineRule(/^\s+/, this.ignore),
            lexing_1.MachineRule(/^"/, this.readSTRING),
            lexing_1.MachineRule(/^\{/, this.readTEX),
            lexing_1.MachineRule(/^/, this.readLITERAL),
        ];
    }
    FIELD_VALUE.prototype.readSTRING = function () {
        return this.attachState(STRING).read();
    };
    FIELD_VALUE.prototype.readTEX = function () {
        return this.attachState(TEX).read().toString();
    };
    FIELD_VALUE.prototype.readLITERAL = function () {
        var literalString = this.attachState(LITERAL).read();
        // literal numbers pass through
        if (/^\d+$/.test(literalString)) {
            return literalString;
        }
        // everything else is considered a single string variable
        return createInterpolator('$' + literalString);
    };
    return FIELD_VALUE;
})(lexing_1.MachineState);
exports.FIELD_VALUE = FIELD_VALUE;
/**
Produces a [string, string] tuple of the field name/key and field value.

The citekey is a special case, and returns a [citekey, null] tuple.
*/
var FIELD = (function (_super) {
    __extends(FIELD, _super);
    function FIELD() {
        _super.apply(this, arguments);
        // this.value is the field key/name
        this.rules = [
            lexing_1.MachineRule(/^\s+/, this.ignore),
            // could be a citekey:
            lexing_1.MachineRule(/^,/, this.popCiteKey),
            // otherwise, it's a field (key + value):
            lexing_1.MachineRule(/^=/, this.popField),
            lexing_1.MachineRule(/^./, this.captureMatch),
        ];
    }
    FIELD.prototype.popCiteKey = function () {
        return [this.value.join(''), null];
    };
    FIELD.prototype.popField = function () {
        var key = this.value.join('').toLowerCase();
        var fieldValue = this.attachState(FIELD_VALUE).read();
        return [key, fieldValue];
    };
    return FIELD;
})(StringCaptureState);
exports.FIELD = FIELD;
/**
This is the outermost state while within the braces of a BibTeX entry, e.g.,

    @article{ FIELDS... }

It pops when reaching the closing brace or the EOF, ignores whitespace and
commas, and transitions to the FIELD state when reaching anything else.
*/
var FIELDS = (function (_super) {
    __extends(FIELDS, _super);
    function FIELDS() {
        _super.apply(this, arguments);
        this.value = [];
        this.rules = [
            lexing_1.MachineRule(/^\}/, this.pop),
            lexing_1.MachineRule(/^$/, this.pop),
            lexing_1.MachineRule(/^(\s+|,)/, this.ignore),
            lexing_1.MachineRule(/^/, this.pushFIELD),
        ];
    }
    FIELDS.prototype.pushFIELD = function () {
        this.value.push(this.attachState(FIELD).read());
        return undefined;
    };
    return FIELDS;
})(lexing_1.MachineState);
exports.FIELDS = FIELDS;
/**
This is the outermost state while over a full BibTeX entry, entered when
encountering a @ character which is not one of the special commands like
@preamble or @string.
*/
var BIBTEX_ENTRY = (function (_super) {
    __extends(BIBTEX_ENTRY, _super);
    function BIBTEX_ENTRY() {
        _super.apply(this, arguments);
        // this.value is the pubtype string
        this.rules = [
            lexing_1.MachineRule(/^\{/, this.popFIELDS),
            lexing_1.MachineRule(/^(.|\s)/, this.captureMatch),
        ];
    }
    BIBTEX_ENTRY.prototype.popFIELDS = function () {
        var pubtype = this.value.join('');
        var citekey = null;
        var fields = {};
        this.attachState(FIELDS).read().forEach(function (_a) {
            var name = _a[0], value = _a[1];
            if (value === null) {
                // set citekey
                citekey = name;
            }
            else {
                // add field
                fields[name] = value;
            }
        });
        return { pubtype: pubtype, citekey: citekey, fields: fields };
    };
    return BIBTEX_ENTRY;
})(StringCaptureState);
exports.BIBTEX_ENTRY = BIBTEX_ENTRY;
/**
The state can be extended to produce either a single BibTeXEntry or an array of
BibTeXEntry instances.
*/
var BibTeXEntryCaptureState = (function (_super) {
    __extends(BibTeXEntryCaptureState, _super);
    function BibTeXEntryCaptureState() {
        _super.apply(this, arguments);
        this.value = [];
        this.stringVariables = {};
        this.rules = [
            // EOF
            lexing_1.MachineRule(/^$/, this.pop),
            // special entry types
            lexing_1.MachineRule(/^@comment\{/i, this.pushComment),
            lexing_1.MachineRule(/^@preamble\{/i, this.pushPreamble),
            lexing_1.MachineRule(/^@string\s*\{/i, this.pushString),
            // reference
            lexing_1.MachineRule(/^@/, this.pushBibTeXEntry),
            // whitespace
            lexing_1.MachineRule(/^(.|\s)/, this.ignore),
        ];
    }
    BibTeXEntryCaptureState.prototype.pushComment = function () {
        var tex = this.attachState(TEX).read();
        // simply discard it
        return undefined;
    };
    BibTeXEntryCaptureState.prototype.pushPreamble = function () {
        var tex = this.attachState(TEX).read();
        // discard it
        return undefined;
    };
    BibTeXEntryCaptureState.prototype.pushString = function () {
        var fieldTuples = this.attachState(FIELDS).read();
        // fieldTuples *should* have only one entry
        var _a = fieldTuples[0], name = _a[0], value = _a[1];
        this.stringVariables[name] = value.toString(this.stringVariables);
        return undefined;
    };
    BibTeXEntryCaptureState.prototype.pushBibTeXEntry = function () {
        var _this = this;
        var _a = this.attachState(BIBTEX_ENTRY).read(), pubtype = _a.pubtype, citekey = _a.citekey, bibFields = _a.fields;
        var fields = {};
        Object.keys(bibFields).forEach(function (name) {
            var fieldValueString = bibFields[name].toString(_this.stringVariables);
            var normalizedString = fieldValueString.replace(/\s+/g, ' ');
            // TODO: other normalizations?
            fields[name] = normalizedString;
        });
        var bibTeXEntry = new models_1.BibTeXEntry(pubtype, citekey, fields);
        this.value.push(bibTeXEntry);
        return undefined;
    };
    return BibTeXEntryCaptureState;
})(lexing_1.MachineState);
exports.BibTeXEntryCaptureState = BibTeXEntryCaptureState;
/**
This state reads the input to the end and collects all BibTeXEntry instances.
*/
var BIBFILE = (function (_super) {
    __extends(BIBFILE, _super);
    function BIBFILE() {
        _super.apply(this, arguments);
    }
    return BIBFILE;
})(BibTeXEntryCaptureState);
exports.BIBFILE = BIBFILE;
/**
This state returns after reading the first BibTeXEntry instance.
*/
var BIBFILE_FIRST = (function (_super) {
    __extends(BIBFILE_FIRST, _super);
    function BIBFILE_FIRST() {
        _super.apply(this, arguments);
    }
    BIBFILE_FIRST.prototype.pushBibTeXEntry = function () {
        _super.prototype.pushBibTeXEntry.call(this);
        return this.value[0];
    };
    return BIBFILE_FIRST;
})(BibTeXEntryCaptureState);
exports.BIBFILE_FIRST = BIBFILE_FIRST;

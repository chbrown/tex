var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="type_declarations/index.d.ts" />
var lexing = require('lexing');
var Rule = lexing.MachineRule;
// all the classes below extend the lexing.MachineState base class,
// and are roughly in order of inheritance / usage
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
})(lexing.MachineState);
var STRING = (function (_super) {
    __extends(STRING, _super);
    function STRING() {
        _super.apply(this, arguments);
        this.rules = [
            Rule(/^\\"/, this.captureMatch),
            Rule(/^"/, this.pop),
            Rule(/^(.|\r|\n)/, this.captureMatch),
        ];
    }
    STRING.prototype.pop = function () {
        return this.value.join('');
    };
    return STRING;
})(StringCaptureState);
exports.STRING = STRING;
var LITERAL = (function (_super) {
    __extends(LITERAL, _super);
    function LITERAL() {
        _super.apply(this, arguments);
        this.rules = [
            // accept a contiguous string of anything but whitespace and commas
            Rule(/^[^,\s]+/, this.captureMatch),
            Rule(/^/, this.pop),
        ];
    }
    return LITERAL;
})(STRING);
exports.LITERAL = LITERAL;
var TEX = (function (_super) {
    __extends(TEX, _super);
    function TEX() {
        _super.apply(this, arguments);
        this.rules = [
            Rule(/^\\\{/, this.captureMatch),
            Rule(/^\{/, this.captureTEX),
            Rule(/^\}/, this.pop),
            Rule(/^(.|\r|\n)/, this.captureMatch),
        ];
    }
    TEX.prototype.captureTEX = function () {
        var texValue = new TEX(this.iterable).read();
        this.value.push('{', texValue, '}');
        return undefined;
    };
    return TEX;
})(STRING);
exports.TEX = TEX;
var BIBTEX_STRING = (function (_super) {
    __extends(BIBTEX_STRING, _super);
    function BIBTEX_STRING() {
        _super.apply(this, arguments);
        // this is a pass-through state, so no need to initialize anything
        this.rules = [
            Rule(/^\s+/, this.ignore),
            Rule(/^"/, this.readSTRING),
            Rule(/^\{/, this.readTEX),
            Rule(/^/, this.readLITERAL),
        ];
    }
    BIBTEX_STRING.prototype.readSTRING = function () {
        return new STRING(this.iterable).read();
    };
    BIBTEX_STRING.prototype.readTEX = function () {
        return new TEX(this.iterable).read();
    };
    BIBTEX_STRING.prototype.readLITERAL = function () {
        return new LITERAL(this.iterable).read();
    };
    return BIBTEX_STRING;
})(lexing.MachineState);
exports.BIBTEX_STRING = BIBTEX_STRING;
var FIELD = (function (_super) {
    __extends(FIELD, _super);
    function FIELD() {
        _super.apply(this, arguments);
        this.rules = [
            Rule(/^\s+/, this.ignore),
            // could be a citekey:
            Rule(/^,/, this.popCiteKey),
            // otherwise, it's a field (key + value):
            Rule(/^=/, this.popField),
            Rule(/^./, this.captureMatch),
        ];
    }
    FIELD.prototype.popCiteKey = function () {
        return [this.value.join(''), null];
    };
    FIELD.prototype.popField = function () {
        var bibtexString = new BIBTEX_STRING(this.iterable).read();
        return [this.value.join(''), bibtexString];
    };
    return FIELD;
})(StringCaptureState);
exports.FIELD = FIELD;
var FIELDS = (function (_super) {
    __extends(FIELDS, _super);
    function FIELDS() {
        _super.apply(this, arguments);
        this.value = { pubtype: null, citekey: null, fields: {} };
        this.rules = [
            Rule(/^\}/, this.pop),
            Rule(/^(\s+|,)/, this.ignore),
            Rule(/^/, this.pushFIELD),
        ];
    }
    FIELDS.prototype.pushFIELD = function () {
        var fieldValue = new FIELD(this.iterable).read();
        if (fieldValue[1] === null) {
            // set citekey
            this.value.citekey = fieldValue[0];
        }
        else {
            // add field
            this.value.fields[fieldValue[0]] = fieldValue[1];
        }
        return undefined;
    };
    return FIELDS;
})(lexing.MachineState);
exports.FIELDS = FIELDS;
var REFERENCE = (function (_super) {
    __extends(REFERENCE, _super);
    function REFERENCE() {
        _super.apply(this, arguments);
        // this.value is the pubtype string
        this.rules = [
            Rule(/^\{/, this.popFIELDS),
            Rule(/^(.|\s)/, this.captureMatch),
        ];
    }
    REFERENCE.prototype.popFIELDS = function () {
        var fieldsValue = new FIELDS(this.iterable).read();
        return { pubtype: this.value.join(''), citekey: fieldsValue.citekey, fields: fieldsValue.fields };
    };
    return REFERENCE;
})(StringCaptureState);
exports.REFERENCE = REFERENCE;
var ReferenceCaptureState = (function (_super) {
    __extends(ReferenceCaptureState, _super);
    function ReferenceCaptureState() {
        _super.apply(this, arguments);
        this.value = [];
        this.rules = [
            // EOF
            Rule(/^$/, this.pop),
            // reference
            Rule(/^@/, this.pushReference),
            // whitespace
            Rule(/^(.|\s)/, this.ignore),
        ];
    }
    ReferenceCaptureState.prototype.pushReference = function () {
        var reference = new REFERENCE(this.iterable).read();
        this.value.push(reference);
        return undefined;
    };
    return ReferenceCaptureState;
})(lexing.MachineState);
var BIBFILE = (function (_super) {
    __extends(BIBFILE, _super);
    function BIBFILE() {
        _super.apply(this, arguments);
    }
    return BIBFILE;
})(ReferenceCaptureState);
exports.BIBFILE = BIBFILE;
var BIBFILE_FIRST = (function (_super) {
    __extends(BIBFILE_FIRST, _super);
    function BIBFILE_FIRST() {
        _super.apply(this, arguments);
    }
    BIBFILE_FIRST.prototype.pushReference = function () {
        return new REFERENCE(this.iterable).read();
    };
    return BIBFILE_FIRST;
})(ReferenceCaptureState);
exports.BIBFILE_FIRST = BIBFILE_FIRST;

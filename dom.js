var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/** Reference, a.k.a., BibTeX entry, is like a Citation but:
* Also has a citation-key and,
* Contains properties as a list instead of as a dictionary.

Valid tag keys:

  address
  annote
  author
  booktitle
  chapter
  crossref
  edition
  editor
  eprint
  howpublished
  institution
  journal
  key
  month
  note
  number
  organization
  pages
  publisher
  school
  series
  title
  type
  url
  volume
  year

http://en.wikipedia.org/wiki/BibTeX uses "Reference" and "Entry" apparently
interchangeably, but I think "Reference" is more descriptive.

The list of keys above is also from the BibTeX page on Wikipedia.
*/
var Reference = (function () {
    function Reference(pubtype, citekey, fields) {
        if (fields === void 0) { fields = {}; }
        this.pubtype = pubtype;
        this.citekey = citekey;
        this.fields = fields;
    }
    Reference.prototype.toBibTeX = function (indent, newline) {
        var _this = this;
        if (indent === void 0) { indent = '  '; }
        if (newline === void 0) { newline = '\n'; }
        var keys = Object.keys(this.fields);
        var tag_lines = keys.map(function (key) { return ("" + indent + key + " = {" + _this.fields[key] + "},"); });
        return "@" + this.pubtype + "{" + this.citekey + "," + newline + tag_lines.join(newline) + newline + "}";
    };
    Reference.prototype.toJSON = function () {
        var obj = {
            pubtype: this.pubtype,
            citekey: this.citekey,
        };
        for (var key in this.fields) {
            obj[key] = this.fields[key];
        }
        return obj;
    };
    return Reference;
})();
exports.Reference = Reference;
var TextNode = (function () {
    function TextNode(value) {
        this.value = value;
    }
    TextNode.prototype.toString = function (tex) {
        return this.value;
    };
    TextNode.prototype.toJSON = function () {
        return this.value;
    };
    return TextNode;
})();
exports.TextNode = TextNode;
var ParentNode = (function () {
    function ParentNode(children) {
        if (children === void 0) { children = []; }
        this.children = children;
    }
    /**
    Return a flattened string representation
    - no braces
    - contains commands
    - and escapes
  
    Return a string representation, but:
    - Surround representation of children with braces ({...})
    - If root is true, do not surround the add external braces for the very first level.
  
    [].join('') === '', which is convenient because we want '' for childless nodes
    */
    ParentNode.prototype.toString = function (tex) {
        if (tex === void 0) { tex = false; }
        var contents = this.children.map(function (child) { return child.toString(tex); }).join('');
        if (tex) {
            return "{" + contents + "}";
        }
        // TODO: normalize whitespace here?
        return contents;
    };
    ParentNode.prototype.toJSON = function () {
        return this.children;
    };
    return ParentNode;
})();
exports.ParentNode = ParentNode;
var combining_characters = {
    '`': '\u0300',
    "'": '\u0301',
    '^': '\u0302',
    '"': '\u0308',
    'H': '\u030B',
    '~': '\u0303',
    'c': '\u0327',
    'k': '\u0328',
    '=': '\u0304',
    'b': '\u0331',
    '.': '\u0307',
    'd': '\u0323',
    'r': '\u030a',
    'u': '\u0306',
    'v': '\u030c',
};
var special_characters = {
    'l': '\u0142',
    'o': '\u00F8',
    'i': '\u0131',
    'j': '\u0237',
};
var MacroNode = (function (_super) {
    __extends(MacroNode, _super);
    function MacroNode(name, children) {
        if (children === void 0) { children = []; }
        _super.call(this, children);
        this.name = name;
    }
    MacroNode.prototype.toString = function (tex) {
        if (tex === void 0) { tex = false; }
        var body = _super.prototype.toString.call(this, tex);
        if (tex) {
            // turning it back into tex is easy
            return "\\" + this.name + body;
        }
        // flattening it is more difficult.
        if (this.name in combining_characters) {
            // the combining character goes after the character it modified
            body += combining_characters[this.name];
        }
        else if (this.name in special_characters) {
            // body should be empty in these cases, but we'll append it anyway
            body = special_characters[this.name] + body;
        }
        else if (this.name == '-') {
            // kind of a weird place to handle hyphenation hints, I admin
            body = '' + body;
        }
        else {
        }
        return body;
    };
    MacroNode.prototype.toJSON = function () {
        return {
            macro: this.name,
            children: this.children,
        };
    };
    return MacroNode;
})(ParentNode);
exports.MacroNode = MacroNode;

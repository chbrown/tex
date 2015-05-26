/// <reference path="type_declarations/index.d.ts" />
import lexing = require('lexing');
var Rule = lexing.MachineRule;

import {Reference, Node, TextNode, ParentNode, MacroNode} from './dom';

// all the classes below extend the lexing.MachineState base class,
// and are roughly in order of inheritance / usage

class StringCaptureState<T> extends lexing.MachineState<T, string[]> {
  protected value = [];
  captureMatch(matchValue: RegExpMatchArray) {
    this.value.push(matchValue[0]);
    return undefined;
  }
}

export class STRING extends StringCaptureState<string> {
  rules = [
    Rule(/^\\"/, this.captureMatch),
    Rule(/^"/, this.pop),
    Rule(/^(.|\r|\n)/, this.captureMatch),
  ]
  pop(): string {
    return this.value.join('');
  }
}

export class LITERAL extends STRING {
  rules = [
    // accept a contiguous string of anything but whitespace and commas
    Rule(/^[^,\s]+/, this.captureMatch),
    Rule(/^/, this.pop),
  ]
}

export class TEX extends lexing.MachineState<ParentNode, ParentNode> {
  protected value = new ParentNode();
  rules = [
    Rule(/^\\([\\{}%&$#_ ])/, this.captureText), // escaped slash or brace or percent
    Rule(/^\\([`'^"~=.-]|[A-Za-z]+)/, this.captureMacro), // macro name
    Rule(/^\{/, this.captureParent),
    Rule(/^\}/, this.pop),
    Rule(/^([^\\{}%]+)/, this.captureText), // a string of anything except slashes or braces
  ]
  pop(): ParentNode {
    // combine macros with their children, if any
    // is there a better way / place to do this?
    var children = this.value.children;
    for (var i = 0, node: Node; (node = children[i]); i++) {
      if (node instanceof MacroNode) {
        var nextNode: Node = children[i + 1];
        if (nextNode instanceof ParentNode) {
          node.children = nextNode.children;
          // dispose of the next child
          children.splice(i + 1, 1);
        }
        else if (nextNode instanceof TextNode) {
          node.children = [new TextNode(nextNode.value[0])];
          nextNode.value = nextNode.value.slice(1);
        }
        // TODO: is \'\i possible?
      }
    }
    return this.value;
  }
  captureText(matchValue: RegExpMatchArray) {
    var textNode = new TextNode(matchValue[1]);
    this.value.children.push(textNode);
    return undefined;
  }
  captureMacro(matchValue: RegExpMatchArray) {
    var macroNode = new MacroNode(matchValue[1], []);
    this.value.children.push(macroNode);
    return undefined;
  }
  captureParent() {
    var parentNode = this.attachState(TEX).read();
    this.value.children.push(parentNode);
    return undefined;
  }
}

export class BIBTEX_STRING extends lexing.MachineState<string, any> {
  // this is a pass-through state, so no need to initialize anything
  rules = [
    Rule(/^\s+/, this.ignore),
    Rule(/^"/, this.readSTRING),
    Rule(/^\{/, this.readTEX),
    Rule(/^/, this.readLITERAL),
  ]
  readSTRING(): string {
    return this.attachState(STRING).read();
  }
  readTEX(): string {
    return this.attachState(TEX).read().toString();
  }
  readLITERAL(): string {
    return this.attachState(LITERAL).read();
  }
}

export class FIELD extends StringCaptureState<[string, string]> {
  rules = [
    Rule(/^\s+/, this.ignore),
    // could be a citekey:
    Rule(/^,/, this.popCiteKey),
    // otherwise, it's a field (key + value):
    Rule(/^=/, this.popField),
    Rule(/^./, this.captureMatch),
  ]
  popCiteKey(): [string, string] {
    return [this.value.join(''), null];
  }
  popField(): [string, string] {
    var bibtexString = this.attachState(BIBTEX_STRING).read();
    var normalizedString = bibtexString.replace(/\s+/g, ' ');
    // TODO: other normalizations?
    return [this.value.join(''), normalizedString];
  }
}

export class FIELDS extends lexing.MachineState<Reference, Reference> {
  protected value = new Reference(null, null);
  rules = [
    Rule(/^\}/, this.pop),
    Rule(/^$/, this.pop), // this happens quite a bit, apparently
    Rule(/^(\s+|,)/, this.ignore),
    Rule(/^/, this.pushFIELD),
  ]
  pushFIELD() {
    var fieldValue = this.attachState(FIELD).read();
    if (fieldValue[1] === null) {
      // set citekey
      this.value.citekey = fieldValue[0];
    }
    else {
      // add field
      this.value.fields[fieldValue[0]] = fieldValue[1];
    }
    return undefined;
  }
}

export class REFERENCE extends StringCaptureState<Reference> {
  // this.value is the pubtype string
  rules = [
    Rule(/^\{/, this.popFIELDS),
    Rule(/^(.|\s)/, this.captureMatch),
  ]
  popFIELDS(): Reference {
    var fieldsValue = this.attachState(FIELDS).read();
    return new Reference(this.value.join(''), fieldsValue.citekey, fieldsValue.fields);
  }
}

class ReferenceCaptureState<T> extends lexing.MachineState<T, string[]> {
  protected value = [];
  rules = [
    // EOF
    Rule(/^$/, this.pop),
    // reference
    Rule(/^@/, this.pushReference),
    // whitespace
    Rule(/^(.|\s)/, this.ignore),
  ]
  pushReference() {
    var reference = this.attachState(REFERENCE).read();
    this.value.push(reference);
    return undefined;
  }
}

export class BIBFILE extends ReferenceCaptureState<Reference[]> { }

export class BIBFILE_FIRST extends ReferenceCaptureState<Reference> {
  pushReference(): Reference {
    return this.attachState(REFERENCE).read();
  }
}

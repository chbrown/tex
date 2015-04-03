/// <reference path="type_declarations/index.d.ts" />
import lexing = require('lexing');
var Rule = lexing.MachineRule;

interface IReference {
  pubtype: string;
  citekey: string;
  fields: {[index: string]: string};
}

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
    Rule(/^./, this.captureMatch),
  ]
  pop(): string {
    return this.value.join('');
  }
}

export class LITERAL extends STRING {
  rules = [
    Rule(/^\S+/, this.captureMatch),
    Rule(/^/, this.pop),
  ]
}

export class TEX extends STRING {
  rules = [
    Rule(/^\\\{/, this.captureMatch),
    Rule(/^\{/, this.captureTEX),
    Rule(/^\}/, this.pop),
    Rule(/^(.|\r|\n)/, this.captureMatch),
  ]
  captureTEX() {
    var texValue = new TEX(this.iterable).read();
    this.value.push('{', texValue, '}');
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
    return new STRING(this.iterable).read();
  }
  readTEX(): string {
    return new TEX(this.iterable).read();
  }
  readLITERAL(): string {
    return new LITERAL(this.iterable).read();
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
    var bibtexString = new BIBTEX_STRING(this.iterable).read();
    return [this.value.join(''), bibtexString];
  }
}

export class FIELDS extends lexing.MachineState<IReference, IReference> {
  protected value: IReference = { pubtype: null, citekey: null, fields: {} };
  rules = [
    Rule(/^\}/, this.pop),
    Rule(/^(\s+|,)/, this.ignore),
    Rule(/^/, this.pushFIELD),
  ]
  pushFIELD() {
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
  }
}

export class REFERENCE extends StringCaptureState<IReference> {
  // this.value is the pubtype string
  rules = [
    Rule(/^\{/, this.popFIELDS),
    Rule(/^(.|\s)/, this.captureMatch),
  ]
  popFIELDS(): IReference {
    var fieldsValue = new FIELDS(this.iterable).read();
    return { pubtype: this.value.join(''), citekey: fieldsValue.citekey, fields: fieldsValue.fields };
  }
}

export class BIBFILE extends lexing.MachineState<IReference[], IReference[]> {
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
    var reference = new REFERENCE(this.iterable).read();
    this.value.push(reference);
    return undefined;
  }
}

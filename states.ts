import {MachineState, MachineRule as Rule} from 'lexing';

import {BibTeXEntry} from './models';
import {Node, TextNode, ParentNode, MacroNode} from './dom';

// all the classes below extend the MachineState base class,
// and are roughly in order of inheritance / usage

/**
This state is triggered by an opening brace, {, and should return when it hits
the matching closing brace, }.

TeX's special characters:

    # $ % & \ ^ _ { }

Except \^ is a valid command, for circumflex accents.
*/
export class TEX extends MachineState<ParentNode, ParentNode> {
  protected value = new ParentNode();
  rules: Rule<ParentNode>[] = [
    Rule(/^\\([#$%&\\_{} ])/, this.captureText), // escaped special character or space
    Rule(/^\\([`'^"~=.@-]|[A-Za-z]+)/, this.captureMacro), // macro name
    Rule(/^\{/, this.captureParent),
    Rule(/^\}/, this.pop),
    Rule(/^([^\\{}]+)/, this.captureText), // a string of anything except slashes or braces
  ]
  pop(): ParentNode {
    // combine macros with their children, if any
    // is there a better way / place to do this?
    const children = this.value.children;
    for (let i = 0, node: Node; (node = children[i]); i++) {
      if (node instanceof MacroNode) {
        const nextNode: Node = children[i + 1];
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
    const textNode = new TextNode(matchValue[1]);
    this.value.children.push(textNode);
    return undefined;
  }
  captureMacro(matchValue: RegExpMatchArray) {
    const macroNode = new MacroNode(matchValue[1], []);
    this.value.children.push(macroNode);
    return undefined;
  }
  captureParent() {
    const parentNode = this.attachState(TEX).read();
    this.value.children.push(parentNode);
    return undefined;
  }
}

export abstract class StringCaptureState<T> extends MachineState<T, string[]> {
  protected value: string[] = [];
  captureMatch(matchValue: RegExpMatchArray): T {
    this.value.push(matchValue[0]);
    return undefined;
  }
}

export class STRING extends StringCaptureState<string> {
  rules: Rule<string>[] = [
    Rule(/^\\"/, this.captureMatch),
    Rule(/^"/, this.pop),
    Rule(/^(.|\r|\n)/, this.captureMatch),
  ]
  pop(): string {
    return this.value.join('');
  }
}

/**
This state consumes a contiguous string of anything but whitespace, commas, and
end braces.
*/
export class LITERAL extends STRING {
  rules: Rule<string>[] = [
    Rule(/^[^,}\s]+/, this.captureMatch),
    Rule(/^/, this.pop),
  ]
}

/**
Since some field values may not be completely interpretable in their local
context, e.g., if they refer to a string variable, we cannot simply return
a string from the FIELD_VALUE state.
*/
export interface BibFieldValue {
  toString(stringVariables: {[index: string]: string}): string;
}

function createInterpolator(value: string): BibFieldValue {
  return {
    toString(stringVariables: {[index: string]: string}) {
      return value.replace(/\$(\w+)/g, (match, group1) => stringVariables[group1]);
    },
  };
}

export class FIELD_VALUE extends MachineState<BibFieldValue, {}> {
  // this is a pass-through state, so no need to initialize anything
  rules: Rule<BibFieldValue>[] = [
    Rule(/^\s+/, this.ignore),
    Rule(/^"/, this.readSTRING),
    Rule(/^\{/, this.readTEX),
    Rule(/^/, this.readLITERAL),
    // TODO: support #-concatenation
  ]
  readSTRING(): BibFieldValue {
    return this.attachState(STRING).read();
  }
  readTEX(): BibFieldValue {
    return this.attachState(TEX).read().toString();
  }
  readLITERAL(): BibFieldValue {
    const literalString = this.attachState(LITERAL).read();
    // literal numbers pass through
    if (/^\d+$/.test(literalString)) {
      return literalString;
    }
    // everything else is considered a single string variable
    return createInterpolator('$' + literalString);
  }
}

export type BibField = [string, BibFieldValue];

/**
Produces a [string, BibFieldValue] tuple of the field name/key and field value.

The citekey is a special case, and returns a [citekey, null] tuple.
*/
export class FIELD extends StringCaptureState<BibField> {
  // this.value is the field key/name
  rules: Rule<BibField>[] = [
    Rule(/^\s+/, this.ignore),
    // could be a citekey:
    Rule(/^,/, this.popCiteKey),
    // otherwise, it's a field (key + value):
    Rule(/^=/, this.popField),
    Rule(/^./, this.captureMatch),
  ]
  popCiteKey(): BibField {
    return [this.value.join(''), null];
  }
  popField(): BibField {
    const key = this.value.join('').toLowerCase();
    const fieldValue = this.attachState(FIELD_VALUE).read();
    return [key, fieldValue];
  }
}

/**
This is the outermost state while within the braces of a BibTeX entry, e.g.,

    @article{ FIELDS... }

It pops when reaching the closing brace or the EOF, ignores whitespace and
commas, and transitions to the FIELD state when reaching anything else.
*/
export class FIELDS extends MachineState<BibField[], BibField[]> {
  protected value: BibField[] = [];
  rules: Rule<BibField[]>[] = [
    Rule(/^\}/, this.pop),
    Rule(/^$/, this.pop), // this happens quite a bit, apparently
    Rule(/^(\s+|,)/, this.ignore),
    Rule(/^/, this.pushFIELD),
  ]
  pushFIELD(): BibField[] {
    this.value.push(this.attachState(FIELD).read());
    return undefined;
  }
}

/**
Not quite a full BibTeXEntry instance, since the fields have not yet been
interpolated.
*/
export interface UnresolvedBibTeXEntry {
  pubtype: string;
  citekey: string;
  fields: BibField[];
}

/**
This is the outermost state while over a full BibTeX entry, entered when
encountering a @ character which is not one of the special commands like
@preamble or @string.
*/
export class BIBTEX_ENTRY extends StringCaptureState<UnresolvedBibTeXEntry> {
  // this.value is the pubtype string
  rules: Rule<UnresolvedBibTeXEntry>[] = [
    Rule(/^\{/, this.popFIELDS),
    Rule(/^(.|\s)/, this.captureMatch),
  ]
  popFIELDS(): UnresolvedBibTeXEntry {
    const pubtype = this.value.join('');
    let citekey: string = null;
    const fields: [string, BibFieldValue][] = [];
    this.attachState(FIELDS).read().forEach(([name, value]) => {
      if (value === null) {
        if (citekey === null) {
          // set citekey
          citekey = name;
        }
        else {
          // almost certainly a parsing error if we see a second citekey
          fields.push(['parsing-error', name]);
        }
      }
      else {
        // add field
        fields.push([name, value]);
      }
    })
    return {pubtype, citekey, fields};
  }
}

/**
The state can be extended to produce either a single BibTeXEntry or an array of
BibTeXEntry instances.
*/
export abstract class BibTeXEntryCaptureState<T> extends MachineState<T, BibTeXEntry[]> {
  protected value: BibTeXEntry[] = [];
  protected stringVariables: {[index: string]: string} = {};
  rules: Rule<T>[] = [
    // EOF
    Rule(/^$/, this.pop),
    // special entry types
    Rule(/^@comment\{/i, this.pushComment),
    Rule(/^@preamble\{/i, this.pushPreamble),
    Rule(/^@string\s*\{/i, this.pushString),
    // reference
    Rule(/^@/, this.pushBibTeXEntry),
    // whitespace
    Rule(/^(.|\s)/, this.ignore),
  ]
  pushComment(): T {
    const tex = this.attachState(TEX).read();
    // simply discard it
    return undefined;
  }
  pushPreamble(): T {
    const tex = this.attachState(TEX).read();
    // discard it
    return undefined;
  }
  pushString(): T {
    const fieldTuples = this.attachState(FIELDS).read();
    // fieldTuples *should* have only one entry
    const [name, value] = fieldTuples[0];
    this.stringVariables[name] = value.toString(this.stringVariables);
    return undefined;
  }
  pushBibTeXEntry(): T {
    const {pubtype, citekey, fields: unresolvedFields} = this.attachState(BIBTEX_ENTRY).read();
    const fields = unresolvedFields.map(([name, unresolvedValue]) => {
      let fieldValueString = unresolvedValue.toString(this.stringVariables);
      let normalizedString = fieldValueString.replace(/\s+/g, ' ');
      // TODO: other normalizations?
      // why can't TypeScript generalize between [string, string] and string[]?
      return <[string, string]>[name, normalizedString];
    });
    this.value.push({pubtype, citekey, fields});
    return undefined;
  }
}

/**
This state reads the input to the end and collects all BibTeXEntry instances.
*/
export class BIBFILE extends BibTeXEntryCaptureState<BibTeXEntry[]> { }

/**
This state returns after reading the first BibTeXEntry instance.
*/
export class BIBFILE_FIRST extends BibTeXEntryCaptureState<BibTeXEntry> {
  pushBibTeXEntry(): BibTeXEntry {
    super.pushBibTeXEntry();
    return this.value[0];
  }
}

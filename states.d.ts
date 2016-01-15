import { MachineState, MachineRule as Rule } from 'lexing';
import { BibTeXEntry } from './models';
import { ParentNode } from './dom';
/**
This state is triggered by an opening brace, {, and should return when it hits
the matching closing brace, }.

TeX's special characters:

    # $ % & \ ^ _ { }

Except \^ is a valid command, for circumflex accents.
*/
export declare class TEX extends MachineState<ParentNode, ParentNode> {
    protected value: ParentNode;
    rules: Rule<ParentNode>[];
    pop(): ParentNode;
    captureText(matchValue: RegExpMatchArray): any;
    captureMacro(matchValue: RegExpMatchArray): any;
    captureParent(): any;
}
export declare abstract class StringCaptureState<T> extends MachineState<T, string[]> {
    protected value: string[];
    captureMatch(matchValue: RegExpMatchArray): T;
}
export declare class STRING extends StringCaptureState<string> {
    rules: Rule<string>[];
    pop(): string;
}
/**
This state consumes a contiguous string of anything but whitespace, commas, and
end braces.
*/
export declare class LITERAL extends STRING {
    rules: Rule<string>[];
}
/**
Since some field values may not be completely interpretable in their local
context, e.g., if they refer to a string variable, we cannot simply return
a string from the FIELD_VALUE state.
*/
export interface BibFieldValue {
    toString(stringVariables: {
        [index: string]: string;
    }): string;
}
export declare class FIELD_VALUE extends MachineState<BibFieldValue, {}> {
    rules: Rule<BibFieldValue>[];
    readSTRING(): BibFieldValue;
    readTEX(): BibFieldValue;
    readLITERAL(): BibFieldValue;
}
export declare type BibField = [string, BibFieldValue];
/**
Produces a [string, string] tuple of the field name/key and field value.

The citekey is a special case, and returns a [citekey, null] tuple.
*/
export declare class FIELD extends StringCaptureState<BibField> {
    rules: Rule<BibField>[];
    popCiteKey(): BibField;
    popField(): BibField;
}
/**
This is the outermost state while within the braces of a BibTeX entry, e.g.,

    @article{ FIELDS... }

It pops when reaching the closing brace or the EOF, ignores whitespace and
commas, and transitions to the FIELD state when reaching anything else.
*/
export declare class FIELDS extends MachineState<BibField[], BibField[]> {
    protected value: BibField[];
    rules: Rule<BibField[]>[];
    pushFIELD(): BibField[];
}
/**
Not quite a full BibTeXEntry instance, since the fields have not yet been
interpolated.
*/
export interface BibEntry {
    pubtype: string;
    citekey: string;
    fields: {
        [index: string]: BibFieldValue;
    };
}
/**
This is the outermost state while over a full BibTeX entry, entered when
encountering a @ character which is not one of the special commands like
@preamble or @string.
*/
export declare class BIBTEX_ENTRY extends StringCaptureState<BibEntry> {
    rules: Rule<BibEntry>[];
    popFIELDS(): BibEntry;
}
/**
The state can be extended to produce either a single BibTeXEntry or an array of
BibTeXEntry instances.
*/
export declare abstract class BibTeXEntryCaptureState<T> extends MachineState<T, BibTeXEntry[]> {
    protected value: BibTeXEntry[];
    protected stringVariables: {
        [index: string]: string;
    };
    rules: Rule<T>[];
    pushComment(): T;
    pushPreamble(): T;
    pushString(): T;
    pushBibTeXEntry(): T;
}
/**
This state reads the input to the end and collects all BibTeXEntry instances.
*/
export declare class BIBFILE extends BibTeXEntryCaptureState<BibTeXEntry[]> {
}
/**
This state returns after reading the first BibTeXEntry instance.
*/
export declare class BIBFILE_FIRST extends BibTeXEntryCaptureState<BibTeXEntry> {
    pushBibTeXEntry(): BibTeXEntry;
}

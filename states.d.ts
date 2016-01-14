import { MachineState, MachineRule as Rule } from 'lexing';
import { BibTeXEntry } from './models';
import { ParentNode } from './dom';
export declare abstract class StringCaptureState<T> extends MachineState<T, string[]> {
    protected value: any[];
    captureMatch(matchValue: RegExpMatchArray): T;
}
export declare class STRING extends StringCaptureState<string> {
    rules: Rule<string>[];
    pop(): string;
}
export declare class LITERAL extends STRING {
    rules: Rule<string>[];
}
/**
TeX's special characters:

    # $ % & \ ^ _ { }

Yeah, except \^ is a valid command, for circumflex accents.

*/
export declare class TEX extends MachineState<ParentNode, ParentNode> {
    protected value: ParentNode;
    rules: Rule<any>[];
    pop(): ParentNode;
    captureText(matchValue: RegExpMatchArray): any;
    captureMacro(matchValue: RegExpMatchArray): any;
    captureParent(): any;
}
export declare class BIBTEX_STRING extends MachineState<string, any> {
    rules: Rule<string>[];
    readSTRING(): string;
    readTEX(): string;
    readLITERAL(): string;
}
/**
Produces a [string, string] tuple of the field name/key and field value.
*/
export declare class FIELD extends StringCaptureState<[string, string]> {
    rules: Rule<[string, string]>[];
    popCiteKey(): [string, string];
    popField(): [string, string];
}
export declare class FIELDS extends MachineState<BibTeXEntry, BibTeXEntry> {
    protected value: BibTeXEntry;
    rules: Rule<any>[];
    pushFIELD(): any;
}
export declare class BIBTEX_ENTRY extends StringCaptureState<BibTeXEntry> {
    rules: Rule<BibTeXEntry>[];
    popFIELDS(): BibTeXEntry;
}
/**
The state can be extended to produce either a single BibTeXEntry or an array of
BibTeXEntry instances.
*/
export declare abstract class BibTeXEntryCaptureState<T> extends MachineState<T, BibTeXEntry[]> {
    protected value: BibTeXEntry[];
    rules: Rule<T>[];
    pushPreamble(): T;
    abstract pushBibTeXEntry(): T;
}
/**
This state reads the input to the end and collects all BibTeXEntry instances.
*/
export declare class BIBFILE extends BibTeXEntryCaptureState<BibTeXEntry[]> {
    pushBibTeXEntry(): BibTeXEntry[];
}
/**
This state returns after reading the first BibTeXEntry instance.
*/
export declare class BIBFILE_FIRST extends BibTeXEntryCaptureState<BibTeXEntry> {
    pushBibTeXEntry(): BibTeXEntry;
}

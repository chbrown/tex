declare module dom {
    export class TextNode {
        value: string;
        constructor(value: string);
        toString(tex?: boolean): string;
        toJSON(): string;
    }
    export class ParentNode {
        children: Node[];
        constructor(children?: Node[]);
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
        toString(tex?: boolean): string;
        toJSON(): any;
    }
    export class MacroNode extends ParentNode {
        name: string;
        constructor(name: string, children?: Node[]);
        toString(tex?: boolean): string;
        toJSON(): any;
    }
    export type Node = TextNode | ParentNode | MacroNode;
}

declare module "tex" {
    /**
    Reference is a flat representation of a BibTeXEntry; it does not retain
    information about the order of the fields, so it is not suitable for
    reconstruction of the original BibTeX file, but sufficient for being used
    downstream.

    The list of field types comes from Wikipedia, which I figure is as good a
    reference as any (https://en.wikipedia.org/wiki/BibTeX#Field_types), to which
    I've also added 'eprint' and 'url'.
    */
    interface Reference {
        pubtype: string;
        citekey: string;
        address?: string;
        annote?: string;
        author?: string;
        booktitle?: string;
        chapter?: string;
        crossref?: string;
        edition?: string;
        editor?: string;
        eprint?: string;
        howpublished?: string;
        institution?: string;
        journal?: string;
        key?: string;
        month?: string;
        note?: string;
        number?: string;
        organization?: string;
        pages?: string;
        publisher?: string;
        school?: string;
        series?: string;
        title?: string;
        type?: string;
        url?: string;
        volume?: string;
        year?: string;
    }
    /**
    BibTeXEntry is a more faithful representation of an individual entry from a
    BibTeX file than is Reference, mostly because it lists the fields as a list
    instead of as a dictionary.

    The valid values for the keys of `fields` are the optional properties from
    `Reference`.
    */
    class BibTeXEntry {
        pubtype: string;
        citekey: string;
        fields: {
            [index: string]: string;
        };
        constructor(pubtype: string, citekey: string, fields?: {
            [index: string]: string;
        });
        toBibTeX(indent?: string, newline?: string): string;
        toJSON(): Reference;
        static fromJSON(object: Reference): BibTeXEntry;
    }
    function parseBibTeXEntry(string: string): BibTeXEntry;
    function parseBibTeXEntries(string: string): BibTeXEntry[];
    function parseNode(string: string): dom.ParentNode;
}

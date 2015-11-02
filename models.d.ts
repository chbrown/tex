/**
Reference is a flat representation of a BibTeXEntry; it does not retain
information about the order of the fields, so it is not suitable for
reconstruction of the original BibTeX file, but sufficient for being used
downstream.

The list of field types comes from Wikipedia, which I figure is as good a
reference as any (https://en.wikipedia.org/wiki/BibTeX#Field_types), to which
I've also added 'eprint' and 'url'.
*/
export interface Reference {
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
export declare class BibTeXEntry {
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

import { ParentNode } from './dom';
import { BibTeXEntry } from './models';
export declare function parseBibTeXEntry(string: string): BibTeXEntry;
export declare function parseBibTeXEntries(string: string): BibTeXEntry[];
export declare function parseNode(tex: string): ParentNode;
export declare function extractCitekeys(tex: string): string[];

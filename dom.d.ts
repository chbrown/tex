export declare const combining_characters: {
    '`': string;
    "'": string;
    '^': string;
    '"': string;
    'H': string;
    '~': string;
    'c': string;
    'k': string;
    '=': string;
    'b': string;
    '.': string;
    'd': string;
    'r': string;
    'u': string;
    'v': string;
};
export declare const special_characters: {
    'l': string;
    'o': string;
    'i': string;
    'j': string;
};
export declare class TextNode {
    value: string;
    constructor(value: string);
    toString(tex?: boolean): string;
    toJSON(): string;
}
export declare class ParentNode {
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
export declare class MacroNode extends ParentNode {
    name: string;
    constructor(name: string, children?: Node[]);
    toString(tex?: boolean): string;
    toJSON(): any;
}
export declare type Node = TextNode | ParentNode | MacroNode;

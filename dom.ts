export class TextNode {
  constructor(public value: string) { }
  toString(tex?: boolean): string {
    return this.value;
  }
  toJSON() {
    return this.value;
  }
}

export class ParentNode {
  constructor(public children: Node[] = []) { }

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
  toString(tex: boolean = false): string {
    var contents = this.children.map(child => child.toString(tex)).join('');
    if (tex) {
      return `{${contents}}`;
    }
    // TODO: normalize whitespace here?
    return contents;
  }

  toJSON(): any {
    return this.children;
  }
}

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
  // 't': '\u03',
}

var special_characters = {
  'l': '\u0142', // l with stroke: ł
  'o': '\u00F8', // o with stroke: ø
  'i': '\u0131', // dotless i: ı
  'j': '\u0237', // dotless j: ȷ
};

export class MacroNode extends ParentNode {
  constructor(public name: string, children: Node[] = []) { super(children) }
  toString(tex: boolean = false): string {
    var body = super.toString(tex);
    if (tex) {
      // turning it back into tex is easy
      return `\\${this.name}${body}`;
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
      // console.error(`ignoring macro: ${this.name}`)
    }
    return body;
  }
  toJSON(): any {
    return {
      macro: this.name,
      children: this.children,
    };
  }
}

export type Node = TextNode | ParentNode | MacroNode;

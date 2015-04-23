declare module "tex" {
  export module bib {
    function parseReferences(string: string): Reference[];
    function parseReference(string: string): Reference;
    class Reference {
      constructor(pubtype: string, citekey: string, fields?: {[index: string]: string});
      pubtype: string;
      citekey: string;
      fields: {[index: string]: string};
      toBibTeX(indent?: string, newline?: string): string;
      toJSON(): {[index: string]: string}
    }
  }
  export module tex {
    function parseNode(string: string): ParentNode;
    class ParentNode {
      constructor(children: Node[]);
      children: Node[];
      toString(tex: boolean): string;
      toJSON(): any;
    }
  }
}

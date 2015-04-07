export interface StringMap {
  [index: string]: string;
}

export interface Reference {
  pubtype: string;
  citekey: string;
  fields: {[index: string]: string};
}

export interface TeXNode {
  children: TeXNode[];
}

import fs = require('fs');
import bib = require('../bib');

export function bibTest(filenames: string[]) {
  filenames.forEach(filename => {
    var string = fs.readFileSync(filename, 'utf8');
    try {
      bib.parseReferences(string);
    }
    catch (exc) {
      console.error(filename);
    }
  });
}

export function bibFormat(filenames: string[]) {
  filenames.forEach(filename => {
    var string = fs.readFileSync(filename, 'utf8');
    bib.parseReferences(string).forEach(reference => {
      console.log(reference.toBibTeX());
    });
  });
}

export function bibJSON(filenames: string[]) {
  filenames.forEach(filename => {
    var string = fs.readFileSync(filename, 'utf8');
    bib.parseReferences(string).forEach(reference => {
      console.log(JSON.stringify(reference, null, '  '));
    });
  });
}

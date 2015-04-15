import fs = require('fs');
import logger = require('loge');

import bib = require('../bib');
import tex = require('../tex');

export function bibTest(filenames: string[]) {
  filenames.forEach(filename => {
    logger.debug('bib-test "%s"', filename);
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
    logger.debug('bib-format "%s"', filename);
    var string = fs.readFileSync(filename, 'utf8');
    bib.parseReferences(string).forEach(reference => {
      console.log(reference.toBibTeX());
    });
  });
}

export function bibJSON(filenames: string[]) {
  filenames.forEach(filename => {
    logger.debug('bib-json "%s"', filename);
    var string = fs.readFileSync(filename, 'utf8');
    bib.parseReferences(string).forEach(reference => {
      console.log(JSON.stringify(reference));
    });
  });
}

export function texFlatten(filenames: string[]) {
  filenames.forEach(filename => {
    logger.debug('tex-flatten "%s"', filename);
    var string = fs.readFileSync(filename, 'utf8');
    var node = tex.parseNode(string);
    console.log(node.toString());
  });
}

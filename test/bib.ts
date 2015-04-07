/// <reference path="../type_declarations/index.d.ts" />
import assert = require('assert');

import bib = require('../bib');

function checkParseReference(input: string, expected_output: bib.Reference, start?: string) {
  var output = bib.parseReference(input);
  assert.deepEqual(output, expected_output, `parse result does not match expected output.
    "${input}"
    when parsed => ${JSON.stringify(output)}
    but should  == ${JSON.stringify(expected_output)}`);
}

describe('BibTeX parser', () => {

  it('should parse an easy inproceedings reference', () => {
    var input = `@inproceedings{li-ritter-hovy:2014,
      author    = {Li, Jiwei  and  Ritter, Alan  and  Hovy, Eduard},
      title     = {Weakly Supervised User Profile Extraction from Twitter},
      booktitle = {Proceedings of the 52nd Annual Meeting of the ACL (Volume 1: Long Papers)},
      month     = {June},
      year      = {2014},
      address   = {Baltimore, Maryland},
      publisher = {Association for Computational Linguistics},
      pages     = {165--174},
      url       = {http://www.aclweb.org/anthology/P14-1016}
    }`;
    var expected_output = new bib.Reference('inproceedings', 'li-ritter-hovy:2014', {
      author: 'Li, Jiwei  and  Ritter, Alan  and  Hovy, Eduard',
      title: 'Weakly Supervised User Profile Extraction from Twitter',
      booktitle: 'Proceedings of the 52nd Annual Meeting of the ACL (Volume 1: Long Papers)',
      month: 'June',
      year: '2014',
      address: 'Baltimore, Maryland',
      publisher: 'Association for Computational Linguistics',
      pages: '165--174',
      url: 'http://www.aclweb.org/anthology/P14-1016',
    });
    checkParseReference(input, expected_output);
  });

  it('should parse Hicks example reference from http://en.wikipedia.org/wiki/BibTeX', () => {
    var input = `@Book{hicks2001,
     author    = "von Hicks, III, Michael",
     title     = "Design of a Carbon Fiber Composite Grid Structure for the GLAST
              Spacecraft Using a Novel Manufacturing Technique",
     publisher = "Stanford Press",
     year      =  2001,
     address   = "Palo Alto",
     edition   = "1st",
     isbn      = "0-69-697269-4"
    }`;
    var expected_output = new bib.Reference('Book', 'hicks2001', {
      author: 'von Hicks, III, Michael',
      title: 'Design of a Carbon Fiber Composite Grid Structure for the GLAST\n              Spacecraft Using a Novel Manufacturing Technique',
      publisher: 'Stanford Press',
      year: '2001',
      address: 'Palo Alto',
      edition: '1st',
      isbn: '0-69-697269-4',
    });
    checkParseReference(input, expected_output);
  });

  it('should parse Torre example reference from http://en.wikipedia.org/wiki/BibTeX', () => {
    var input = `@Book{Torre2008,
      author    = "Joe Torre and Tom Verducci",
      publisher = "Doubleday",
      title     = "The Yankee Years",
      year      =  2008,
      isbn      = "0385527403"
    }`;
    var expected_output = new bib.Reference('Book', 'Torre2008', {
      author: 'Joe Torre and Tom Verducci',
      publisher: 'Doubleday',
      title: 'The Yankee Years',
      year: '2008',
      isbn: '0385527403',
    });
    checkParseReference(input, expected_output);
  });

});

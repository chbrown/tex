/// <reference path="../type_declarations/index.d.ts" />
var assert = require('assert');
var bib = require('../bib');
function checkParseReference(input, expected_output, start) {
    var output = bib.parseReference(input);
    assert.deepEqual(output, expected_output, "parse result does not match expected output.\n    \"" + input + "\"\n    when parsed => " + JSON.stringify(output) + "\n    but should  == " + JSON.stringify(expected_output));
}
describe('BibTeX parser', function () {
    it('should parse an easy inproceedings reference', function () {
        var input = "@inproceedings{li-ritter-hovy:2014,\n      author    = {Li, Jiwei  and  Ritter, Alan  and  Hovy, Eduard},\n      title     = {Weakly Supervised User Profile Extraction from Twitter},\n      booktitle = {Proceedings of the 52nd Annual Meeting of the ACL (Volume 1: Long Papers)},\n      month     = {June},\n      year      = {2014},\n      address   = {Baltimore, Maryland},\n      publisher = {Association for Computational Linguistics},\n      pages     = {165--174},\n      url       = {http://www.aclweb.org/anthology/P14-1016}\n    }";
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
    it('should parse an example reference from http://en.wikipedia.org/wiki/BibTeX', function () {
        var input = "@Book{hicks2001,\n     author    = \"von Hicks, III, Michael\",\n     title     = \"Design of a Carbon Fiber Composite Grid Structure for the GLAST\n              Spacecraft Using a Novel Manufacturing Technique\",\n     publisher = \"Stanford Press\",\n     year      =  2001,\n     address   = \"Palo Alto\",\n     edition   = \"1st\",\n     isbn      = \"0-69-697269-4\"\n    }";
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
    it('should parse a second example reference from http://en.wikipedia.org/wiki/BibTeX', function () {
        var input = "@Book{Torre2008,\n      author    = \"Joe Torre and Tom Verducci\",\n      publisher = \"Doubleday\",\n      title     = \"The Yankee Years\",\n      year      =  2008,\n      isbn      = \"0385527403\"\n    }";
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

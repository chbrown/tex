var fs = require('fs');
var bib = require('../bib');
function bibTest(filenames) {
    filenames.forEach(function (filename) {
        var string = fs.readFileSync(filename, 'utf8');
        try {
            bib.parseReferences(string);
        }
        catch (exc) {
            console.error(filename);
        }
    });
}
exports.bibTest = bibTest;
function bibFormat(filenames) {
    filenames.forEach(function (filename) {
        var string = fs.readFileSync(filename, 'utf8');
        bib.parseReferences(string).forEach(function (reference) {
            console.log(reference.toBibTeX());
        });
    });
}
exports.bibFormat = bibFormat;
function bibJSON(filenames) {
    filenames.forEach(function (filename) {
        var string = fs.readFileSync(filename, 'utf8');
        bib.parseReferences(string).forEach(function (reference) {
            console.log(JSON.stringify(reference));
        });
    });
}
exports.bibJSON = bibJSON;

var fs = require('fs');
var logger = require('loge');
var bib = require('../bib');
var tex = require('../tex');
function bibTest(filenames) {
    filenames.forEach(function (filename) {
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
exports.bibTest = bibTest;
function bibFormat(filenames) {
    filenames.forEach(function (filename) {
        logger.debug('bib-format "%s"', filename);
        var string = fs.readFileSync(filename, 'utf8');
        bib.parseReferences(string).forEach(function (reference) {
            console.log(reference.toBibTeX());
        });
    });
}
exports.bibFormat = bibFormat;
function bibJSON(filenames) {
    filenames.forEach(function (filename) {
        logger.debug('bib-json "%s"', filename);
        var string = fs.readFileSync(filename, 'utf8');
        bib.parseReferences(string).forEach(function (reference) {
            console.log(JSON.stringify(reference));
        });
    });
}
exports.bibJSON = bibJSON;
function texFlatten(filenames) {
    filenames.forEach(function (filename) {
        logger.debug('tex-flatten "%s"', filename);
        var string = fs.readFileSync(filename, 'utf8');
        var node = tex.parseNode(string);
        console.log(node.toString());
    });
}
exports.texFlatten = texFlatten;

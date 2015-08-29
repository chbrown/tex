/// <reference path="type_declarations/index.d.ts" />
var lexing = require('lexing');
var loge_1 = require('loge');
var yargs = require('yargs');
var fs_1 = require('fs');
var states = require('./states');
var models = require('./models');
exports.BibTeXEntry = models.BibTeXEntry;
function parseBibTeXEntry(string) {
    var string_iterable = new lexing.StringIterator(string);
    return new states.BIBFILE_FIRST(string_iterable, 1024).read();
}
exports.parseBibTeXEntry = parseBibTeXEntry;
function parseBibTeXEntries(string) {
    var string_iterable = new lexing.StringIterator(string);
    return new states.BIBFILE(string_iterable, 1024).read();
}
exports.parseBibTeXEntries = parseBibTeXEntries;
function parseNode(tex) {
    var string_iterable = new lexing.StringIterator(tex);
    // skip over the initial {
    string_iterable.skip(1);
    return new states.TEX(string_iterable).read();
}
exports.parseNode = parseNode;
function extractCitekeys(tex) {
    var citekeys = [];
    // super-simple regular expression solution (doesn't detect commented-out citations)
    var cite_regexp = /\\\w*cite\w*\{([^}]+)\}/g;
    var match;
    while ((match = cite_regexp.exec(tex)) !== null) {
        var match_citekeys = match[1].split(',');
        Array.prototype.push.apply(citekeys, match_citekeys);
    }
    return citekeys;
}
exports.extractCitekeys = extractCitekeys;
var cliCommands = {
    'bib-format': function (filename) {
        loge_1.logger.debug('bib-format "%s"', filename);
        var data = fs_1.readFileSync(filename, 'utf8');
        parseBibTeXEntries(data).forEach(function (reference) {
            console.log(reference.toBibTeX());
        });
    },
    'bib-json': function (filename) {
        loge_1.logger.debug('bib-json "%s"', filename);
        var data = fs_1.readFileSync(filename, 'utf8');
        parseBibTeXEntries(data).forEach(function (reference) {
            console.log(JSON.stringify(reference));
        });
    },
    'bib-test': function (filename) {
        loge_1.logger.debug('bib-test "%s"', filename);
        var data = fs_1.readFileSync(filename, 'utf8');
        try {
            parseBibTeXEntries(data);
        }
        catch (exc) {
            console.error(filename);
        }
    },
    'tex-flatten': function (filename) {
        loge_1.logger.debug('tex-flatten "%s"', filename);
        var data = fs_1.readFileSync(filename, 'utf8');
        var node = parseNode(data);
        console.log(node.toString());
    },
    'tex-citekeys': function (filename) {
        loge_1.logger.debug('tex-citekeys "%s"', filename);
        var data = fs_1.readFileSync(filename, 'utf8');
        var citekeys = extractCitekeys(data);
        console.log(citekeys.join('\n'));
    },
};
function cli() {
    var yargs_parser = yargs
        .usage('Usage: tex-cli <command> [<arg1> [<arg2> ...]]')
        .command('bib-test', 'Test that the given files can be parsed as BibTeX entries, printing the filename of unparseable files to STDERR')
        .command('bib-json', 'Parse bib files and format as JSON')
        .command('bib-format', 'Parse bib files and format as standard BibTeX')
        .command('tex-flatten', 'Extract the text part from a string of TeX')
        .command('tex-citekeys', 'Extract the citekeys references in a TeX document (using RegExp)')
        .describe({
        help: 'print this help message',
        json: 'print JSON output',
        verbose: 'print debug messages',
        version: 'print version',
    })
        .alias({
        help: 'h',
        verbose: 'v',
    })
        .boolean([
        'help',
        'verbose',
    ]);
    var argv = yargs_parser.argv;
    loge_1.logger.level = argv.verbose ? loge_1.Level.debug : loge_1.Level.info;
    if (argv.help) {
        yargs_parser.showHelp();
    }
    else if (argv.version) {
        console.log(require('./package.json').version);
    }
    else {
        var _a = yargs_parser.demand(1).argv._, command = _a[0], filenames = _a.slice(1);
        var cliCommand = cliCommands[command];
        if (cliCommand === undefined) {
            console.error('Unrecognized command: "%s"', command);
            process.exit(1);
        }
        process.on('SIGINT', function () {
            console.error('Ctrl+C :: SIGINT!');
            process.exit(130);
        });
        process.stdout.on('error', function (err) {
            if (err.code == 'EPIPE') {
                process.exit(0);
            }
        });
        filenames.forEach(cliCommand);
    }
}
exports.cli = cli;

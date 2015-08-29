/// <reference path="type_declarations/index.d.ts" />
import * as lexing from 'lexing';
import {logger, Level} from 'loge';
import yargs = require('yargs');
import {readFileSync} from 'fs';

import states = require('./states');
import {ParentNode} from './dom';
import * as models from './models';

export var BibTeXEntry = models.BibTeXEntry;

export function parseBibTeXEntry(string: string): models.BibTeXEntry {
  var string_iterable = new lexing.StringIterator(string);
  return new states.BIBFILE_FIRST(string_iterable, 1024).read();
}

export function parseBibTeXEntries(string: string): models.BibTeXEntry[] {
  var string_iterable = new lexing.StringIterator(string);
  return new states.BIBFILE(string_iterable, 1024).read();
}

export function parseNode(tex: string): ParentNode {
  var string_iterable = new lexing.StringIterator(tex);
  // skip over the initial {
  string_iterable.skip(1);
  return new states.TEX(string_iterable).read();
}

export function extractCitekeys(tex: string): string[] {
  var citekeys = [];
  // super-simple regular expression solution (doesn't detect commented-out citations)
  var cite_regexp = /\\\w*cite\w*\{([^}]+)\}/g;
  var match: RegExpExecArray;
  while ((match = cite_regexp.exec(tex)) !== null) {
    var match_citekeys = match[1].split(',');
    Array.prototype.push.apply(citekeys, match_citekeys);
  }
  return citekeys;
}

type CLICommand = (filename: string) => void;

const cliCommands: {[index: string]: CLICommand} = {
  'bib-format': (filename: string) => {
    logger.debug('bib-format "%s"', filename);
    var data = readFileSync(filename, 'utf8');
    parseBibTeXEntries(data).forEach(reference => {
      console.log(reference.toBibTeX());
    });
  },
  'bib-json': (filename: string) => {
    logger.debug('bib-json "%s"', filename);
    var data = readFileSync(filename, 'utf8');
    parseBibTeXEntries(data).forEach(reference => {
      console.log(JSON.stringify(reference));
    });
  },
  'bib-test': (filename: string) => {
    logger.debug('bib-test "%s"', filename);
    var data = readFileSync(filename, 'utf8');
    try {
      parseBibTeXEntries(data);
    }
    catch (exc) {
      console.error(filename);
    }
  },
  'tex-flatten': (filename: string) => {
    logger.debug('tex-flatten "%s"', filename);
    var data = readFileSync(filename, 'utf8');
    var node = parseNode(data);
    console.log(node.toString());
  },
  'tex-citekeys': (filename: string) => {
    logger.debug('tex-citekeys "%s"', filename);
    var data = readFileSync(filename, 'utf8');
    var citekeys: string[] = extractCitekeys(data);
    console.log(citekeys.join('\n'));
  },
};

export function cli() {
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
  logger.level = argv.verbose ? Level.debug : Level.info;

  if (argv.help) {
    yargs_parser.showHelp();
  }
  else if (argv.version) {
    console.log(require('./package.json').version);
  }
  else {
    var [command, ...filenames] = yargs_parser.demand(1).argv._;
    var cliCommand = cliCommands[command];
    if (cliCommand === undefined) {
      console.error('Unrecognized command: "%s"', command);
      process.exit(1);
    }
    process.on('SIGINT', () => {
      console.error('Ctrl+C :: SIGINT!');
      process.exit(130);
    });
    process.stdout.on('error', err => {
      if (err.code == 'EPIPE') {
        process.exit(0);
      }
    });
    filenames.forEach(cliCommand);
  }
}

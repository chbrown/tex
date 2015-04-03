TYPESCRIPT = $(wildcard *.ts test/*.ts)

DefinitelyTyped_names := node/node \
	async/async \
	chalk/chalk \
	lodash/lodash \
	mocha/mocha \
	yargs/yargs

all: $(TYPESCRIPT:%.ts=%.js) \
	$(DefinitelyTyped_names:%=type_declarations/DefinitelyTyped/%.d.ts) type_declarations/DefinitelyTyped.d.ts

%.js: %.ts
	node_modules/.bin/tsc -m commonjs -t ES5 $+

type_declarations/DefinitelyTyped/%:
	mkdir -p $(shell dirname $@)
	curl https://raw.githubusercontent.com/borisyankov/DefinitelyTyped/master/$* > $@

type_declarations/DefinitelyTyped.d.ts:
	for path in $(DefinitelyTyped_names:%=DefinitelyTyped/%.d.ts); do echo "/// <reference path=\"$$path\" />"; done > $@

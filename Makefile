BIN := node_modules/.bin
DTS := node/node async/async chalk/chalk lodash/lodash mocha/mocha yargs/yargs
TYPESCRIPT := $(wildcard *.ts test/*.ts)

all: $(TYPESCRIPT:%.ts=%.js)
type_declarations: $(DTS:%=type_declarations/DefinitelyTyped/%.d.ts)

$(BIN)/mocha $(BIN)/tsc:
	npm install

%.js: %.ts type_declarations $(BIN)/tsc
	$(BIN)/tsc -m commonjs -t ES5 $<

type_declarations/DefinitelyTyped/%:
	mkdir -p $(@D)
	curl -s https://raw.githubusercontent.com/chbrown/DefinitelyTyped/master/$* > $@

.PHONY: test
test: $(BIN)/mocha
	$(BIN)/mocha test/

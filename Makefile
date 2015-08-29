BIN := node_modules/.bin
DTS := mocha/mocha node/node yargs/yargs
TYPESCRIPT := $(wildcard *.ts test/*.ts)

all: $(TYPESCRIPT:%.ts=%.js)
type_declarations: $(DTS:%=type_declarations/DefinitelyTyped/%.d.ts)

$(BIN)/mocha $(BIN)/tsc:
	npm install

%.js: %.ts type_declarations $(BIN)/tsc
	$(BIN)/tsc -m commonjs -t ES5 $<

type_declarations/DefinitelyTyped/%:
	mkdir -p $(@D)
	curl -s https://raw.githubusercontent.com/borisyankov/DefinitelyTyped/master/$* > $@

test: $(BIN)/mocha
	$(BIN)/mocha tests/

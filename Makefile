BIN := node_modules/.bin

all: index.js

$(BIN)/mocha $(BIN)/tsc:
	npm install

%.js %.d.ts: %.ts $(BIN)/tsc
	$(BIN)/tsc -d

test: $(BIN)/mocha
	$(BIN)/mocha --compilers js:babel-core/register tests/

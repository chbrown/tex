BIN := node_modules/.bin

all: index.js

$(BIN)/mocha $(BIN)/tsc:
	npm install

%.js: %.ts $(BIN)/tsc
	$(BIN)/tsc

test: $(BIN)/mocha
	$(BIN)/mocha tests/

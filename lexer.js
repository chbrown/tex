var EventEmitter = require('events').EventEmitter;

var find = function(xs, test) {
  for (var i = 0, length = xs.length; i < length; i++) {
    var x = xs[i];
    if (test(x)) {
      return x;
    }
  }
};

var last = function(xs) {
  return xs[xs.length - 1];
};

function escapeRegex(string) {
  // from MDN
  return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
}

function unescapeRegex(string) {
  return string.replace(/(\\\\)/g, '');
}

// trying to be economical with closure size
// var tautology = function() { return true; };
// var identity = function(x) { return x; };
// var empty = function() { return ''; };
// var wrapLiteral = function(s) { return function() { return s; }; };

var wrapStringEqual = function(string) {
  return function(input) {
    return string == input;
  };
};

var wrapRegexTest = function(regex_string) {
  var regex = new RegExp(regex_string);
  return function(input) {
    return regex.test(input);
  };
};

var parse_fsm_string = function(string) {
  /** finite state machine syntax declaration:

  state
    (match (action)+
    )+
  ...

  Which will be compiled to:

  {
    state: [{
        test: function(input) { return true | false; },
        actions: function(input) { },
      },
      ...
    ]
  }

  literal strings can be denoted with either apostrophes or quotes, but they cannot contain whitespace
  */
  var machine = {};
  string.split(/\n*^\b/m).forEach(function(block_string) {
    var block_parts = block_string.split(/\n\s+/);
    // var state_name =
    machine[block_parts[0]] = block_parts.slice(1).map(function(transition_string) {
      // transition string is like: test action1 action2 ...
      var transition_parts = transition_string.split(/\s/);
      var transition = {};

      // condition can be a regex, string, or .
      var test_string = transition_parts[0];
      transition._test_debug = test_string;
      if (test_string == '.') {
        transition.test = function(input) { return true; };
      }
      else if (/^\/.+\/$/.test(test_string)) {
        transition.test = wrapRegexTest(test_string.slice(1, -1));
      }
      else { // if (/^('|").+\1$/.test(test_string)) {
        // transition.test = wrapStringEqual(test_string.slice(1, -1));
        transition.test = wrapStringEqual(test_string);
      }
      // else {
      //   throw new Error('Unrecognized test: ' + test_string);
      // }

      // actions can be one of: push:state, pop, emit, emit:string
      transition.actions = transition_parts.slice(1);

      return transition;
    });
  });
  return machine;
};

var read_characters = function(readable, callback) {
  /** One way to consume a readable: character by character

  callback: function(Error | null, String | null)
    not really sure whether this is sync or async, I think both. Oops.

  */
  readable.on('readable', function() {
    // I guess this isn't so different from data, but we can control the chunk size
    var input;
    while ((input = readable.read(1)) !== null) {
      // force async with setImmediate here? Too much overhead, though, probably.
      callback(null, input);
    }
  });
  readable.on('error', function(err) {
    callback(err);
  });
  readable.on('end', function(err) {
    // EOF
    callback(null, null);
  });
};

var Lexer = exports.Lexer = function(states, initial_state) {
  /** new Lexer(...): create a new transducer based on a functional specification

  machine: function(current_state, input, callback)
    - current_state: String
        one of a finite set of possible states
    - input: String
        usually a single character
    - callback: function(err, new_state, emission)
        synchronous callback. This should called exactly once.
        - err: Error | null
            the transducer will throw any errors it receives
        - new_state: String
            one of a finite set of possible states (same as current_state)
        - emission: String
            character / string to add to emit when

  the resulting transducer will be called like:

      transducer.parse(readable)

  This will kick off a series of events, including:

  - `error`: `function(err)`
      emitted when the machine returns the callback with an error, with that error
      TODO: also with the position in the readable?
  - `data`: `function(state, buffer)`
      emitted when a state changes, called with:
      * the previous state's name
      * the string collected during that state
  - `end`: `function()`
      emitted when readable hits the end, possibly after flushing any current states

  */
  EventEmitter.call(this); // setup inheritance
  // states is a hash from state names to list of transitions
  this.states = states;
  this.initial_state = initial_state;
  this.stack = [];
  this.emit_buffer = '';
};
Lexer.fromString = function(string, initial_state) {
  var states = parse_fsm_string(string);
  return new Lexer(states, initial_state);
};
// Lexer.prototype = new EventEmitter; // inheritance
Lexer.prototype = Object.create(EventEmitter.prototype); // setup inheritance -- any better than new?
Lexer.prototype.constructor = Lexer; // setup inheritance -- necessary?
Lexer.prototype.flushBuffer = function() {
  if (this.emit_buffer) {
    this.emit('data', this.stack, this.emit_buffer);
    this.emit_buffer = '';
  }
};
Lexer.prototype.feed = function(input) {
  /** read a single character, returning a bool showing whether that
  character was consumed or not.
  */
  var transitions = this.states[last(this.stack) || 'ROOT'];
  if (!transitions) {
    this.emit('error', 'Illegal state "' + last(this.stack) + '"');
  }

  var active_transition = find(transitions, function(transition) {
    return transition.test(input);
  });

  var actions = active_transition ? active_transition.actions : ['emit'];

  var consume = false;
  // apply actions
  for (var i = 0, action; (action = actions[i]) !== undefined; i++) {
    // actions can be one of: push:state, pop, emit, emit:string
    if (action == 'emit') {
      this.emit_buffer += input;
      consume = true;
    }
    else if (action == 'drop') {
      consume = true;
    }
    else if (action == 'pop') {
      this.flushBuffer();
      this.stack.pop();
    }
    else if (/^push:/.test(action)) {
      this.flushBuffer();
      var push_match = action.match(/^push:(.+)$/);
      this.stack.push(push_match[1]);
    }
    else {
      this.emit('error', 'Illegal action "' + action + '" while in state "' + last(this.stack) + '"');
    }
  }

  return consume;
};
Lexer.prototype.feedString = function(string) {
  // read_characters just wraps readable+read, error, and end all into one
  var cursor = 0;
  while (cursor < string.length) {
    var consume = this.feed(string[cursor]);
    if (consume) cursor++;
  }
  this.emit('end');
};
Lexer.prototype.mergeEvents = function() {
  var self = this;
  this
    .on('error', function(err) {
      self.emit('message', 'ERROR ' + err.toString());
    })
    .on('data', function(states, body) {
      self.emit('message', 'DATA ' + states.join(':') + '=' + JSON.stringify(body));
    })
    .on('end', function() {
      self.emit('message', 'EOF');
    });
};

/*StreamLexer.prototype.feedStream = function(readable) {
  /** should this be called pipeFrom or something like that?
  that's what it does, really, takes a string readable and tokenizes it

  readable is an instance that emits 'readable' events, listenable with .on(),
  and a .read(characters) method, which returns null if EOF has been reached
  /
  var self = this;
  read_characters(readable, function(err, input) {
    if (err) self.emit('error', err);

    while (self.feed(input));
  });
};*/

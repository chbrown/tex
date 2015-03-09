var TeX = require('./dom/tex').TeX;
var Stack = require('./lib/stack').Stack;

var parse = exports.parse = function(string) {
  // in V8: ('' ? 'y' : 'n') == 'n'
  var stack = new Stack([new TeX()]);
  // console.log('TeX.parse:', string, stack.top);
  var buf = '';

  var flush = function() {
    if (buf) {
      stack.top.push(buf);
      buf = '';
    }
  };

  for (var i = 0, l = string.length; i < l; i++) {
    var c = string.charAt(i);
    if (c === '{') {
      flush();
      // push new node onto the stack
      stack.push(new TeX());
    }
    else if (c === '}') {
      flush();
      // in V8: ([] ? 'y' : 'n') == 'y'
      var child = stack.pop();
      if (stack.top) {
        stack.top.push(child);
      }
      else {
        console.error('Cannot append item to top of empty stack');
      }
    }
    else {
      buf += c;
    }
  }
  flush();
  // maybe throw an error if stack.length > 1 ?
  // otherwise, it will autoclose, i.e., add as many }'s
  // at the end as it needs to for it to make sense
  // is this default sane?
  return stack.root || new TeX();
};

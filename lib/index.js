/*jslint browser: true */ /*globals exports */

exports.extend = function(target /*, sources... */) {
  /** `extend(...)`: just like _.extend(destination, *sources), copy all values
  from each source into destination, overwriting with latter values.

  `destination`: {...} | null.
  */
  if (target === undefined) target = {};
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
};

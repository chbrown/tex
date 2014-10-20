/*jslint browser: true */ /*globals exports */

var Stack = exports.Stack = function(data) {
  /** Stack is mostly an impoverished Array wrapper,
  but with a .top helper */
  this.data = data || [];
  this.refresh();
};
Stack.prototype.push = function(item) {
  // unlike Array.push, return the pushed item
  this.data.push(item);
  this.refresh();
  return item;
};
Stack.prototype.pop = function() {
  // like Array.pop, return the popped item
  var item = this.data.pop();
  this.refresh();
  return item;
};
Stack.prototype.refresh = function() {
  // maybe these should be getters?
  this.length = this.data.length;
  this.root = this.data[0];
  this.top = this.data[this.data.length - 1];
};

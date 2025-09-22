/* Minimal shim so files importing 'node:test' will delegate to Jest's globals */
module.exports.test = function(name, fn) { return global.test ? global.test(name, fn) : undefined; };
module.exports.describe = function(name, fn) { return global.describe ? global.describe(name, fn) : undefined; };
module.exports.it = function(name, fn) { return global.it ? global.it(name, fn) : undefined; };
module.exports.before = function(fn) { return global.beforeAll ? global.beforeAll(fn) : undefined; };
module.exports.after = function(fn) { return global.afterAll ? global.afterAll(fn) : undefined; };

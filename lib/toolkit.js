var isDefined = function (input) {
  return typeof input !== 'undefined';
};

var isInteger = function (input) {
  return typeof input === 'number' && !isNaN(input) && input % 1 === 0;
};

var isIntegerBasedString = function (input) {
  return typeof input === 'string' && isInteger(parseInt(input, 10));
};

var isFunction = function (input) {
  return typeof input === 'function';
};

var isObjectLiteral = function (input) {
  return typeof input === 'object';
};

exports = module.exports = {};

exports.isDefined = isDefined;
exports.isInteger = isInteger;
exports.isIntegerBasedString = isIntegerBasedString;
exports.isFunction = isFunction;
exports.isObjectLiteral = isObjectLiteral;
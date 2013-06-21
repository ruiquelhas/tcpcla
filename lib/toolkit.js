var isDefined = function (input) {
  return typeof input !== 'undefined';
};

var isInteger = function (input) {
  return typeof input === 'number' && !isNaN(input) && input % 1 === 0;
};

var isIntegerBasedString = function (input) {
  return typeof input === 'string' && isInteger(parseInt(input, 10));
};

exports = module.exports = {};

exports.isDefined = isDefined;
exports.isInteger = isInteger;
exports.isIntegerBasedString = isIntegerBasedString;
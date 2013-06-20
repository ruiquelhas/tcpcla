var isInteger = function (input) {
  return typeof input === 'number' && input % 1 === 0;
}

var isIntegerBasedString = function (input) {
  return typeof input === 'string' && isInteger(parseInt(input, 10));
}

exports = module.exports = { };

exports.isInteger = isInteger;
exports.isIntegerBasedString = isIntegerBasedString;
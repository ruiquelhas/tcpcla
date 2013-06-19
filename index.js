var net = require('net');

var INVALID_INPUT = 
  'the argument should be a valid Integer or Integer-based String';

var isInteger = function (input) {
  return typeof input === 'number' && input % 1 === 0;
};

var isIntegerBasedString = function (input) {
  return typeof input === 'string' && isInteger(parseInt(input, 10));
};

var isSupported = function (input) {
  return isInteger(input) || isIntegerBasedString(input);
};

var TCPCLA = {
  createServer: net.createServer,
  connect: net.connect
};

module.exports = TCPCLA;
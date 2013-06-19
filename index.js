var net = require('net');

var INVALID_INPUT = 
  'the argument should be a valid Integer or Integer-based String';

var isInteger = function (input) {
  return typeof input === 'number' && input % 1 === 0;
}

var isIntegerBasedString = function (input) {
  return typeof input === 'string' && isInteger(parseInt(input, 10));
}

var isSupported = function (input) {
  return isInteger(input) || isIntegerBasedString(input);
}

var setupConnection = function (connection, port) {
  connection.listen(port);
  connection.on('connection', function (socket) {
    socket.end();
  });
  connection.on('error', function (err) {
    throw err;
  });
};

var TCPCLA = function (input) {
  if (isSupported(input)) {
    this.connection = net.createServer();
    setupConnection(this.connection, input);
  } else {
    throw new Error(INVALID_INPUT);
  }
}

module.exports = TCPCLA;
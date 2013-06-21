var net = require('net');
var toolkit = require('./lib/toolkit');

// Private helpers

function getServerInstance(options) {
  if (!toolkit.isFunction(options) && toolkit.isObjectLiteral(options)) {
    return net.createServer(options);
  }
  return net.createServer();
}

// Public API

function createServer(header, arg1, arg2) {
  return getServerInstance(arg1).on('connection', function (socket) {
    if (toolkit.isDefined(arg2)) {
      arg2(socket);
    }
    socket.write(header.valueOf());
  });
}

function connect(header, arg1, arg2) {
  var client = net.connect(arg1, function () {
    if (toolkit.isDefined(arg2)) {
      arg2();
    }
    client.write(header.valueOf());
  });
  return client;
}

exports = module.exports = {};

exports.createServer = createServer;
exports.connect = connect;
exports.createConnection = connect;
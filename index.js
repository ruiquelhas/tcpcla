var net = require('net');
var toolkit = require('./lib/toolkit');

function getServerInstance(options) {
  if (!toolkit.isFunction(options) && toolkit.isObjectLiteral(options)) {
    return net.createServer(options);
  }
  return net.createServer();
}

function createServer(header, arg1, arg2) {
  return getServerInstance(arg1).on('connection', function (socket) {
    if (toolkit.isDefined(arg2)) {
      arg2(socket);
    }
    socket.write(header.valueOf());
  });
}

exports = module.exports = {};

exports.createServer = createServer;
exports.connect = net.connect;
exports.createConnection = net.connect;
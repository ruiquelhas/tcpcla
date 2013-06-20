var net = require('net');
var ContactHeader = require('./lib/header');

var createServer = function (header) {
  return net.createServer().on('connection', function (socket) {
    socket.write(header.valueOf());
  });
};

var TCPCLA = {
  createServer: createServer,
  connect: net.connect
};

module.exports = TCPCLA;
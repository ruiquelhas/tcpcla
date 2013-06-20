var 
  net = require('net'),
  ContactHeader = require('./lib/header');

var createServer = function () {
  var server = net.createServer();
  var header = new ContactHeader();
  server.on('connection', function (socket) {
    var data = header.valueOf();
    socket.write(data);
  });
  return server;
};

var TCPCLA = {
  createServer: createServer,
  connect: net.connect
};

module.exports = TCPCLA;
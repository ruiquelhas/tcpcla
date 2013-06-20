var net = require('net');
var ContactHeader = require('./lib/header');

function createServer(header) {
  return net.createServer().on('connection', function (socket) {
    socket.write(header.valueOf());
  });
};

exports = module.exports = {};

exports.createServer = createServer;
exports.connect = net.connect;
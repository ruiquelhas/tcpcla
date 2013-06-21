var net = require('net');

function createServer(header) {
  return net.createServer().on('connection', function (socket) {
    socket.write(header.valueOf());
  });
}

exports = module.exports = {};

exports.createServer = createServer;
exports.connect = net.connect;
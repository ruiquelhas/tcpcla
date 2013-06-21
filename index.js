var net = require('net');
var toolkit = require('./lib/toolkit');

function createServer(header, callback) {
  return net.createServer().on('connection', function (socket) {
    if (toolkit.isDefined(callback)) {
      callback(socket);
    }
    socket.write(header.valueOf());
  });
}

exports = module.exports = {};

exports.createServer = createServer;
exports.connect = net.connect;
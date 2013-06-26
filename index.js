var net = require('net');
var pkg = require('./package.json');
var toolkit = require('./lib/toolkit');

var PACKAGE_VERSION = parseInt(pkg.version.slice(0, 
  pkg.version.indexOf('.')), 10);

var PROTOCOL_MAGIC_FIELD = 'dtn!';
var PROTOCOL_VERSION = PACKAGE_VERSION > 0 ? PACKAGE_VERSION : 1;

var ERROR_MESSAGES = {
  PROTOCOL_MISMATCH: 'the protocol is not supported',
  VERSION_MISMATCH: 'the version is not supported'
};

// Private helpers

function getServerInstance(options) {
  if (!toolkit.isFunction(options) && toolkit.isObjectLiteral(options)) {
    return net.createServer(options);
  }
  return net.createServer();
}

function isDTNConnection(buffer) {
  return (buffer.slice(0, 4).toString('utf8') === PROTOCOL_MAGIC_FIELD);
}

function hasValidVersion(buffer) {
  return (buffer.readUInt8(4) >= PROTOCOL_VERSION);
}

function isValidConnection(socket, callback) {
  socket.on('data', function (chunk) {
    if (!isDTNConnection(chunk)) {
      return callback(ERROR_MESSAGES.PROTOCOL_MISMATCH);
    }
    if (!hasValidVersion(chunk)) {
      return callback(ERROR_MESSAGES.VERSION_MISMATCH);
    }
    return callback();
  });
}

// Public API

function createServer(header, arg1, arg2) {
  return getServerInstance(arg1).on('connection', function (socket) {
    if (toolkit.isDefined(arg2)) {
      arg2(socket);
    }
    socket.write(header);
    isValidConnection(socket, function (err) {
      if (err) {
        socket.end(err);
      }
      // otherwise, continue
    });
  });
}

function connect(header, arg1, arg2) {
  var client = net.connect(arg1, function () {
    if (toolkit.isDefined(arg2)) {
      arg2();
    }
    client.write(header);
    isValidConnection(client, function (err) {
      if (err) {
        client.end(err);
      }
      // otherwise, continue
    });
  });
  return client;
}

exports = module.exports = {};

exports.createServer = createServer;
exports.connect = connect;
exports.createConnection = connect;
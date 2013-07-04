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

var socketPool = [];

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

function setupTransmissionListeners(socket, callback) {
  // data reception handler
  socket.on('data', function (chunk) {
    console.log('[' + socket.localPort + ']', chunk.toString('utf8'));
    var matches = socketPool.filter(function (match) { 
      return match === socket; 
    });
    if (matches.length === 0) {
      if (!isDTNConnection(chunk)) {
        return callback(ERROR_MESSAGES.PROTOCOL_MISMATCH);
      }
      if (!hasValidVersion(chunk)) {
        return callback(ERROR_MESSAGES.VERSION_MISMATCH);
      }
      socketPool.push(socket);
    }
    return callback();
  });
  // error management handler
  socket.on('error', function (err) {
    console.log('[ERROR]', err.message);
    removeSocketFromPool(socket);
  });
}

function removeSocketFromPool(socket) {
  socketPool.splice(socketPool.indexOf(socket), 1);
}

// Public API

function createServer(header, arg1, arg2) {
  return getServerInstance(arg1).on('connection', function (socket) {
    if (toolkit.isDefined(arg2)) {
      arg2(socket);
    }
    setupTransmissionListeners(socket, function (err) {
      if (err) {
        socket.end(err);
      } else {
        // do stuff
      }
    });
    socket.write(header);
  });
}

function connect(header, arg1, arg2) {
  var client = net.connect(arg1, function () {
    if (toolkit.isDefined(arg2)) {
      arg2();
    }
    setupTransmissionListeners(client, function (err) {
      if (err) {
        console.log('[ERROR]', err);
        client.end(err);
      } else {
        // do stuff
      }
    });
    client.write(header);
  });
  return client;
}

exports = module.exports = {};

exports.createServer = createServer;
exports.createConnection = connect;
exports.connect = connect;
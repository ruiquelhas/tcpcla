var test = require('tap').test;
var cla = require('../index');
var ContactHeader = require('../lib/header');

var client, server, port, header;

var setUp = function (options) {
  // ensure the variable is defined
  options = options || { };
  // set auxiliary variables
  port = options.port || 4556;
  header = options.header || new ContactHeader();
  // set up the server
  server = cla.createServer(header);
  server.listen(port);
};

var tearDown = function (options) {
  // close the client connection
  client.end();
  // stop the server
  server.close();
  // nullify the auxiliary variables
  port = null;
  header = null;
};

test('make sure the Convergence Layer connections work', function (t) {
  setUp();
  t.plan(2);
  server.on('connection', function (socket) {
    t.ok(socket, 'the server should acknowledge the client');
    tearDown();
  });
  client = cla.connect(port, function () {
    t.ok(client, 'the client should be able to connet to the server');
  });
});

test('make sure the Contact Header is valid', function (t) {
  setUp();
  t.plan(6);
  client = cla.connect(port);
  client.on('data', function (chunk) {
    var bufferedData = new Buffer(chunk);
    // test the existence of the magic field
    var expectedMagic = new Buffer('dtn!');
    var receivedMagic = new Buffer(expectedMagic.length);
    bufferedData.copy(receivedMagic, 0, 0, 4);
    t.equal(receivedMagic.toString('hex'), expectedMagic.toString('hex'), 
      'the magic segment should match the expected');
    // test the type contained in the version field
    var receivedVersion = new Buffer(1);
    bufferedData.copy(receivedVersion, 0, 4, 5);
    var versionValue = parseInt(receivedVersion[0], 10);
    t.type(versionValue, 'number', 'the version should be a number');
    // test if the flags field is valid
    var receivedFlags = new Buffer(1);
    bufferedData.copy(receivedFlags, 0, 5, 6);
    t.ok(receivedFlags[0] < 16, 
      'the flags buffer value should be less than 16');
    t.notOk(receivedFlags[0] === 4, 
      "the flags buffer value can't be equal to 4");
    t.notOk(receivedFlags[0] === 6, 
      "the flags buffer value can't be equal to 6");
    // test if the keepalive field is valid
    var receivedKeepAlive = new Buffer(2);
    bufferedData.copy(receivedKeepAlive, 0, 6, 8);
    var keepAliveValue = parseInt(receivedKeepAlive[0], 10);
    t.type(keepAliveValue, 'number', 'the interval should be a number'); 
    // finish and cleanup
    tearDown();
  });
});
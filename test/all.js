var 
  test = require('tap').test,
  cla = require('../index'),
  ContactHeader = require('../lib/header');

var client, server, port;

var setup = function () {
  port = 4556;
  server = cla.createServer();
  server.listen(port);
};

test('make sure the Convergence Layer connections work', function (t) {
  t.plan(2);
  setup();
  server.on('connection', function (socket) {
    t.ok(socket, 'the server should acknowledge the client');
    client.end();
    server.close();
  });
  client = cla.connect(port, function () {
    t.ok(client, 'the client should be able to connet to the server');
  });
});

test('make sure a valid Contact Header can be created', function (t) {
  t.plan(1);
  var header = new ContactHeader();
  t.ok(header, 'a new ContactHeader instance should be created');
});

test('make sure the Contact Header is valid', function (t) {
  t.plan(3);
  setup();
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
    t.ok(versionValue < 256, 'the version number should be lower than 256');
    client.end();
    server.close();
  });
});

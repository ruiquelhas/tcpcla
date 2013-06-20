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

test('make sure the Contact Header is exchanged', function (t) {
  t.plan(1);
  setup();
  client = cla.connect(port);
  client.on('data', function (chunk) {
    var bufferedData = new Buffer(chunk);
    var expectedMagic = new Buffer('dtn!');
    var receivedMagic = new Buffer(expectedMagic.length);
    bufferedData.copy(receivedMagic, 0, 0, 4);
    t.equal(receivedMagic.toString('hex'), expectedMagic.toString('hex'), 
      'the magic segment should match the expected');
    client.end();
    server.close();
  });
});

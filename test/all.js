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
  t.plan(2);
  // setup the server
  setUp();
  server.on('connection', function (socket) {
    t.ok(socket, 'the server should acknowledge the client');
    // finish and cleanup
    tearDown();
  });
  client = cla.connect(port, function () {
    t.ok(client, 'the client should be able to connet to the server');
  });
});

var contactHeaderIsValid = function (data, t) {
  t.plan(4);
  t.test('make sure the Magic field is valid', function (t) {
    t.plan(1);
    var expected = new Buffer('dtn!'), got = new Buffer(expected.length);
    data.copy(got, 0, 0, 4);
    t.equal(got.toString('hex'), expected.toString('hex'), 
      'the magic segment should match the expected fixed value');
  });
  t.test('make sure the protocol version is valid', function (t) {
    t.plan(1);
    var got = parseInt(new Buffer([data[4]])[0], 10);
    // the comparison ensures the value we got is not NaN
    t.ok(got <= 255, 'the version should be a number');
  });
  t.test('make sure the flags field is valid', function (t) {
    t.plan(3);
    var got = new Buffer([data[5]])[0];
    t.ok(got < 16, 'the flags buffer value should be less than 16');
    t.notOk(got === 4, 'the flags buffer value should be different than 4');
    t.notOk(got === 6, 'the flags buffer value should be different than 6');
  });
  t.test('make sure keepAlive interval field is valid', function (t) {
    t.plan(1);
    var fieldBuffer = new Buffer([data[6], data[7]]);
    var got = fieldBuffer.readUInt16BE(0);
    // the comparison ensures the value we got is not NaN
    t.ok(got <= 65535, 'the interval should be a number');
  });
};

test('make sure the server replies with a valid Contact Header', function (t) {
  // setup the server
  setUp();
  // setup the client
  client = cla.connect(port);
  client.on('data', function (chunk) {
    contactHeaderIsValid(new Buffer(chunk), t);
    // finish and cleanup
    tearDown();
  });
});

test('make sure the client sends a valid Contact Header', function (t) {
  t.end();
});
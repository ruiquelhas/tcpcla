var test = require('tap').test;
var cla = require('../index');
var ContactHeader = require('../lib/protocol/ContactHeader');

var client, server, port, header, options;

var setUp = function (config) {
  // ensure the variable is defined
  config = config || {};
  // set auxiliary variables
  port = config.port || 4556;
  header = config.header || new ContactHeader();
  options = config.options || {};
  // set up the server
  server = cla.createServer(header, options);
  server.listen(port);
};

var tearDown = function () {
  // close the client connection
  client.end();
  // stop the server
  server.close();
  // nullify the auxiliary variables
  port = null;
  header = null;
};

var contactHeaderIsValid = function (data, t) {
  t.plan(4);
  t.test('make sure the Magic field is valid', function (t) {
    t.plan(1);
    var expected = new Buffer('dtn!'), got = data.slice(0, 4);
    t.equal(got.toString('utf8'), expected.toString('utf8'), 
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
  t.test('make sure the keepAlive interval field is valid', function (t) {
    t.plan(1);
    var fieldBuffer = new Buffer([data[6], data[7]]);
    var got = fieldBuffer.readUInt16BE(0);
    // the comparison ensures the value we got is not NaN
    t.ok(got <= 65535, 'the interval should be a number');
  });
};

test('make sure a valid Contact Header is exchanged', function (t) {
  t.plan(2);
  // setup the server
  setUp();
  t.test('make sure the client sends a Contact Header', function (t) {
    server.on('connection', function (socket) {
      socket.once('data', function (chunk) {
        contactHeaderIsValid(chunk, t);
      });
    });
  });
  // setup the client
  client = cla.connect(header, port);
  t.test('make sure the server sends a Contact Header', function (t) {
    client.once('data', function (chunk) {
      contactHeaderIsValid(chunk, t);
      // finish and cleanup
      tearDown();
    });
  });
});
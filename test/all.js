var 
  test = require('tap').test,
  cla = require('../index'),
  ContactHeader = require('../lib/header');

test('make sure the node can listen to Convergence Layer connections', function (t) {
  t.plan(2);
  var server = cla.createServer(), port = 4556, client;
  server.listen(port, function () {
    client = cla.connect(port);
    client.on('end', function () {
      t.ok(client, 'a client should be able to connect');
    });
    client.on('error', function (err) {
      t.comment(err.message);
    });
    server.close(function () {
      t.ok(server, 'the agent should be able to close gracefully');
    });
  });
});

test('make sure a valid Contact Header can be created', function (t) {
  t.plan(1);
  var header = new ContactHeader();
  t.ok(header, 'a new ContactHeader instance should be created');
});
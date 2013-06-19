var 
  test = require('tap').test,
  cla = require('../index');

test('make sure the node can listen to CL connections', function (t) {
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
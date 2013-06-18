var 
  test = require('tap').test,
  TCPCLA = require('../index');

test('make sure the TCP connection is established', function (t) {
  var cla = new TCPCLA();
  t.end();
});
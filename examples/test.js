var d = require('../lib/distributed');

d(function(node) {
  node.ping({host: 'localhost', port: 9001});
  node.ping({host: 'localhost', port: 9002});
  node.join({host: 'localhost', port: 9002});
});

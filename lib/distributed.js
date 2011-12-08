var http = require('http');

function Node(opts) {
  this.quorum = 3;
  this.writes = 3;
  this.reads = 3;

  if (!opts) {
    opts = {
      host: 'localhost',
      port: '9001'
    };
  }
  if (!(opts.host)) {
    opts.host = 'localhost';
  }
  if (!(opts.port)) {
    opts.port = '9001';
  }

  for (var p in opts) {
    this[p] = opts[p];
  }

  this.server = http.createServer(function(req, res) { console.log('handle req'); handler(req, res); }).listen(this.port, this.host);
  this.cluster = [];

  if (opts.cb) {
    opts.cb(this);
  } else {
    return this;
  }
}

//specify a node in the cluster to join on
Node.prototype.join = function(node) {
  var opts = {
    host: node.host,
    port: node.port,
    path: "/cluster/join"
  };

  join(opts);
}

//specify a node in the cluster to join on
Node.prototype.ping = function(node) {
  var opts = {
    host: node.host,
    port: node.port,
    path: "/cluster/ping"
  };

  ping(opts);
}

function join(opts) {
  http.get(opts, function(res) {
    chunkCollection(res, function(err, buf) {
      console.log("response from join: " + buf.toString("utf8"));
    })
  }).on('error', function(err) {
    console.log(err);
  });
}

function ping(opts) {
  http.get(opts, function(res) {
    chunkCollection(res, function(err, buf) {
      console.log("response from ping: " + buf.toString("utf8"));
    })
  }).on('error', function(err) {
    console.log(err);
  });
}

function chunkCollection(res, cb) {
  var total = 0;
  var chunks = [];
  res.on('end', function() {
    var buf = new Buffer(total);
    var offset = 0;
    for (var i = 0; i < chunks.length; i++) {
      chunks[i].copy(buf, offset, 0);
      offset += chunks[i].length;
    }

    return cb(null, buf);
  });

  res.on('data', function(data) {
    total += data.length;
    chunks.push(data);
  });
}

function handler(req, res) {
  //var headers = req.headers;

  console.log("Req to: " + req.url);

  var content = "ok";
  if (/\/cluster\/ping/.test(req.url)) {
    content = "pong";
  }
  res.writeHead(200, {'Content-Type': 'text/plain', "Content-Length": content.length});
  res.end(content);
}

module.exports = function(config) {
  if (!config) {
    config = {};
  }

  if (typeof config == 'function') {
    config = {
      cb: config
    };
  }

  return new Node(config);
}

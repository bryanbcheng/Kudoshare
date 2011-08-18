var mongodb = require('mongodb'),
    Db = mongodb.Db,
    Server = mongodb.Server;

if (process.env.VCAP_SERVICES) {
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var mongo = env['mongodb-1.8'][0]['credentials'];
} else {
  var mongo = {"hostname":"dbh36.mongolab.com", "port":27367, "username":"cheezburger", "password":"valefor", "name":"", "db":"kudoshare"}
  //var mongo = {"hostname":"localhost", "port":27017, "username":"", "password":"", "name":"", "db":"kudoshare"}
}

console.log(mongo);


var generate_mongo_url = function(obj) {
  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 27017);
  obj.db = (obj.db || 'test');

  if (obj.username && obj.password) {
    return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
  } else {
    return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
}

var mongourl = generate_mongo_url(mongo);
console.log(mongourl);



//var db = new Db(mongo.db, new Server(mongo.hostname, mongo.port, {}), {});
//db.open(function() {});

//db.authenticate(mongo.username, mongo.password);

//console.log(db);

exports.start = function(io) {
  io.configure(function() {
    io.set('transports', [
      'xhr-polling'
    ]);
  });

  io.sockets.on('connection', function(socket) {
    require('mongodb').connect(mongourl, function(err, db) {
      db.collection('kudos', function(err, collection) {
        collection.find({}, { limit:10, sort:[['timestamp', 'desc']] }).toArray(function(err, docs) {
          socket.emit('feed', docs);
        });
      });
    });
    
    // Posting a new kudo
    socket.on('post', function(kudo) {
      kudo.timestamp = new Date();
      
      require('mongodb').connect(mongourl, function(err, db) {
        db.collection('kudos', function(err, collection) {
          if (kudo.fb) {
            collection.insert({ 'from':kudo.from, 'to':kudo.to, 'to_id':kudo.to_id, 'message':kudo.message, 'fb':true, 'fb_id':kudo.fb.id, 'timestamp':kudo.timestamp });
          } else {
            collection.insert({ 'from':kudo.from, 'to':kudo.to, 'message':kudo.message, 'timestamp':kudo.timestamp });
          }
        });
      });
      
      io.sockets.emit('new-kudo', kudo);
    });
    
    // See 10 more kudos
    socket.on('get', function(time, fb_id) {
      require('mongodb').connect(mongourl, function(err, db) {
        db.collection('kudos', function(err, collection) {
          if (fb_id == null) {
            collection.find({timestamp: {$lt: new Date(time)}}, { limit:10, sort:[['timestamp', 'desc']] }).toArray(function(err, docs) {
              socket.emit('more-kudos', docs);
            });
          } else {
            collection.find({fb_id: fb_id, timestamp: {$lt: new Date(time)}}, { limit:10, sort:[['timestamp', 'desc']] }).toArray(function(err, docs) {
              socket.emit('more-kudos', docs, fb_id);
            });
          }
        });
      });
    });
    
    // Filters
    // All
    
    socket.on('all', function() {
      require('mongodb').connect(mongourl, function(err, db) {
        db.collection('kudos', function(err, collection) {
          collection.find({}, { limit:10, sort:[['timestamp', 'desc']] }).toArray(function(err, docs) {
            socket.emit('feed', docs);
          });
        });
      });
    });
    
    // Me
    socket.on('me', function(fb_id) {
      require('mongodb').connect(mongourl, function(err, db) {
        db.collection('kudos', function(err, collection) {
          collection.find({fb_id: fb_id}, { limit:10, sort:[['timestamp', 'desc']] }).toArray(function(err, docs) {
            socket.emit('feed', docs, fb_id);
          });
        });
      });
    });
    
    socket.on('message', function(message) {
        console.log(message);
    });
  });
}
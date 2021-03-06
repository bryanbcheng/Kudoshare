var mongodb = require('mongodb'),
    Db = mongodb.Db,
    Server = mongodb.Server,
    BSONPure = mongodb.BSONPure;

if (process.env.VCAP_SERVICES) {
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var mongo = env['mongodb-1.8'][0]['credentials'];
} else {
  var mongo = {"hostname":"dbh36.mongolab.com", "port":27367, "username":"toucan", "password":"yur45ks2p0sfg", "name":"", "db":"kudoshare"};
  //var mongo = {"hostname":"localhost", "port":27017, "username":"", "password":"", "name":"", "db":"kudoshare"};
}

var generate_mongo_url = function(obj) {
  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 27017);
  obj.db = (obj.db || 'kudoshare');

  if (obj.username && obj.password) {
    return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
  } else {
    return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
}

var mongourl = generate_mongo_url(mongo);

//var db = new Db(mongo.db, new Server(mongo.hostname, mongo.port, {}), {});
//db.open(function() {});

//db.authenticate(mongo.username, mongo.password);

//console.log(db);

exports.start = function(io) {
  io.configure(function() {
    io.set('transports', [
      'websocket',
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
    socket.on('post', function(kudo, publish) {
      kudo.timestamp = new Date();
      require('mongodb').connect(mongourl, function(err, db) {
        db.collection('kudos', function(err, collection) {
          if (kudo.fb) {
            collection.insert({ 'from':kudo.from, 'to':kudo.to, 'to_id':kudo.to_id, 'message':kudo.message, 'fb':true, 'fb_id':kudo.fb.id, 'likes':0, 'timestamp':kudo.timestamp }, function(err, docs) {
              socket.emit('publish', docs[0]);
              io.sockets.emit('new-kudo', docs[0]);
            });
          } else {
            collection.insert({ 'from':kudo.from, 'to':kudo.to, 'message':kudo.message, 'likes':0, 'timestamp':kudo.timestamp }, function(err, docs) {
              io.sockets.emit('new-kudo', docs[0]);
            });
          }
        });
      });
      
      //io.sockets.emit('new-kudo', kudo);
    });
    
    // Like a kudo
    // NEED TO WORK WITH RACE CONDITIONS
    socket.on('like', function(kudo_id, like_count) {
      require('mongodb').connect(mongourl, function(err, db) {
        db.collection('kudos', function(err, collection) {
          collection.findAndModify({ _id: new BSONPure.ObjectID(kudo_id) }, [], {$set: { likes: like_count }}, function(err, object) {
                if (err) console.warn(err.message);
                else io.sockets.emit('update-like', kudo_id, like_count);
            });
        });
      });
    });
    
    
    // Update a kudo with the Facebook post id
    
    socket.on('post-id', function(kudo_id, post_id) {
      require('mongodb').connect(mongourl, function(err, db) {
        db.collection('kudos', function(err, collection) {
          collection.findAndModify({ _id: new BSONPure.ObjectID(kudo_id) }, [], {$set: { post_id: post_id }}, function(err, object) {
                if (err) console.warn(err.message);
                else console.log('successfully updated');
            });
        });
      });
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
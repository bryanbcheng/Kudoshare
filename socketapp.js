var mongodb = require('mongodb'),
    Db = mongodb.Db,
    Server = mongodb.Server;

var mongodb_host = '0.0.0.0';
var mongodb_port = 27017;
var db = new Db('kudoshare', new Server(mongodb_host, mongodb_port, {}), {});
db.open(function() {});

exports.start = function(io) {
  io.sockets.on('connection', function(socket) { 
    db.collection('kudos', function(err, collection) {
      collection.find({}, { limit:10, sort:[['timestamp', 'desc']] }).toArray(function(err, docs) {
        socket.emit('feed', docs);
      });
    });
    
    socket.on('post', function(kudo) {
      kudo.timestamp = new Date();
      
      db.collection('kudos', function(err, collection) {
        if (kudo.fb) {
          collection.insert({ 'from':kudo.from, 'to':kudo.to, 'message':kudo.message, 'fb':true, 'fb_username':kudo.fb.username, 'timestamp':kudo.timestamp })
        } else {
          collection.insert({ 'from':kudo.from, 'to':kudo.to, 'message':kudo.message, 'timestamp':kudo.timestamp });
        }
      });
      
      io.sockets.emit('new-kudo', kudo);
    });
    
    socket.on('get', function(time) {
      db.collection('kudos', function(err, collection) {
        collection.find({timestamp: {$lt: new Date(time)}}, { limit:10, sort:[['timestamp', 'desc']] }).toArray(function(err, docs) {
          socket.emit('more-kudos', docs)
        });
      });
    });
    
    socket.on('message', function(message) {
        console.log(message);
    });
  });
}
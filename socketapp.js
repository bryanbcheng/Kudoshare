var mongodb = require('mongodb'),
    Db = mongodb.Db,
    Server = mongodb.Server;

var mongodb_host = '0.0.0.0';
var mongodb_port = 27017;
var db = new Db('kudoshare', new Server(mongodb_host, mongodb_port, {}), {});
db.open(function() {});

exports.start = function(io) {
  io.sockets.on('connection', function(socket) {  
    socket.on('post', function(kudo, host) {
      // add to database
      
      db.collection('kudos', function(err, collection) {
        collection.insert({ 'from':kudo.from, 'to':kudo.to, 'message':kudo.message });
      });
      
      io.sockets.emit('new-kudo', kudo);
    });
    
    socket.on('message', function(message) {
        console.log(message);
    });
  });
}
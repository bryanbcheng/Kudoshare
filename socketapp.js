var mongodb = require('mongodb'),
    Db = mongodb.Db,
    Server = mongodb.Server;

var db = null;

exports.start = function(io) {
  io.sockets.on('connection', function(socket) {  
    socket.on('post', function(kudo, host, port) {
      // add to database
      db = (db == null)?new Db('kudos', new Server(host, port, {})):db;
      
      io.sockets.emit('new-kudo', kudo);
    });
    
    socket.on('message', function(message) {
        console.log(message);
    });
  });
}
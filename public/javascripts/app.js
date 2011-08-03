(function() {
    var socket = io.connect(); 
 
    socket.on('connect', function() {
        console.log('Connected');
    });
 
    socket.on('message', function(message) {
        console.log(message);
    });
    
    socket.on('new-kudo', function(kudo) {
        $('#feed').prepend("<div class='kudo'><p>" + kudo.from + ": Kudos to " + kudo.to + " for " + kudo.message + "</p></div>");
    });
})();
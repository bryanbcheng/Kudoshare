(function() {
    var socket = io.connect(); 
    
    socket.on('connect', function() {
        console.log('Connected');
        
        
    });
 
    socket.on('message', function(message) {
        console.log(message);
    });
    
    socket.on('feed', function(kudos) {
        $('#loader').hide();
        $.each(kudos, function() {
            $('#feed').addKudo(this);
            $('.timeago').timeago();
        });
        $('#feed').append("<div class='more-kudo'><a href='#'>See more...</a></div>");
        $('#feed .more-kudo a').click(function() {
            socket.emit('get', kudos[kudos.length - 1].timestamp);
            return false;
        });
    });
    
    socket.on('new-kudo', function(kudo) {
        $('#feed').prepend("<div class='kudo'><img src='/images/" + Math.ceil(Math.random()*4) + ".png' /><p><strong>" + kudo.from + "</strong>: Kudos to <strong>" + kudo.to + "</strong> for " + kudo.message + "</p><span class='timeago' title='" + kudo.timestamp + "'></span></div>");
        $('.timeago').timeago();
    });
    
    socket.on('more-kudos', function(kudos) {
        var see_more = $('#feed .more-kudo').detach();
        
        if (kudos.length == 0) {
            $('#feed').append("<div class='more-kudo'>No more kudos. =/</div>")
        } else {
        
            $.each(kudos, function() {
                $('#feed').addKudo(this);
            });
            see_more.children('a').unbind('click').bind('click', function() {
                socket.emit('get', kudos[kudos.length - 1].timestamp);
                return false;
            });
            $('#feed').append(see_more);
        }
    });
})();

$.fn.addKudo = function(kudo) {
    $(this).append("<div class='kudo'><img src='/images/" + Math.ceil(Math.random()*4) + ".png' /><p><strong>" + kudo.from + "</strong>: Kudos to <strong>" + kudo.to + "</strong> for " + kudo.message + "</p><span class='timeago' title='" + kudo.timestamp + "'></span></div>");
    $('.timeago').timeago();
};
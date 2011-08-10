(function() {
    var socket = io.connect(); 
    
    socket.on('connect', function() {
        console.log('Connected');  
    });
 
    socket.on('message', function(message) {
        console.log(message);
    });
    
    socket.on('feed', function(kudos, fb_id) {
        $('#loader').hide();
        $.each(kudos, function() {
            $('#feed').addKudo(this);
            $('.timeago').timeago();
        });
        $('#feed').append("<div class='more-kudo'><a href='#'>See more &#187;</a></div>");
        $('#feed .more-kudo a').click(function() {
            socket.emit('get', kudos[kudos.length - 1].timestamp, fb_id);
            return false;
        });
    });
    
    socket.on('new-kudo', function(kudo) {
        $('#feed').addKudoPre(kudo);
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

$.fn.addKudoPre = function(kudo) {
    if (kudo.fb) {
        $(this).prepend("<div class='kudo'><img src='http://graph.facebook.com/" + kudo.fb.id + "/picture'/><p><strong><a href='" + getProfile(kudo.fb.id) + "'>" + kudo.from + "</a></strong>: Kudos to <strong>" + getLinks(kudo.to, kudo.to_id) + "</strong> for " + kudo.message + "</p><span class='timeago' title='" + kudo.timestamp + "'></span></div>");
    } else {
        $(this).prepend("<div class='kudo'><img src='/images/" + Math.ceil(Math.random()*4) + ".png' /><p><strong>" + kudo.from + "</strong>: Kudos to <strong>" + kudo.to + "</strong> for " + kudo.message + "</p><span class='timeago' title='" + kudo.timestamp + "'></span></div>");
    }
    $('.timeago').timeago();
}

$.fn.addKudo = function(kudo) {
    if (kudo.fb) {
        $(this).append("<div class='kudo'><img src='http://graph.facebook.com/" + kudo.fb_id + "/picture'/><p><strong><a href='" + getProfile(kudo.fb_id) + "'>" + kudo.from + "</a></strong>: Kudos to <strong>" + getLinks(kudo.to, kudo.to_id) + "</strong> for " + kudo.message + "</p><span class='timeago' title='" + kudo.timestamp + "'></span></div>");
    } else {
        $(this).append("<div class='kudo'><img src='/images/" + Math.ceil(Math.random()*4) + ".png' /><p><strong>" + kudo.from + "</strong>: Kudos to <strong>" + kudo.to + "</strong> for " + kudo.message + "</p><span class='timeago' title='" + kudo.timestamp + "'></span></div>");
    }
    $('.timeago').timeago();
};

function split( val ) {
    return val.split( /,\s*/ );
}

function getLinks(to, to_id) {
    if (to_id == "") return to;

    var toArray = split(to);
    var idArray = split(to_id);
    
    var linkArray = new Array();
    
    $.each(idArray, function(i, value) {
        linkArray.push("<a href='" + getProfile(value) + "'>" + toArray[i] + "</a>");
    });
    
    return linkArray.join(', ');
}

function getProfile(id) {
    return "http://www.facebook.com/profile.php?id=" + id;
}
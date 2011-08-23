(function() {
    var socket = io.connect(); 
    
    socket.on('connect', function() {
        console.log('Connected');  
    });
 
    socket.on('message', function(message) {
        console.log(message);
    });
    
    // Load the feed with up to 10 kudos
    socket.on('feed', function(kudos, fb_id) {
        var loader = $('#loader').hide().detach();
        $('#feed').empty();
        if (kudos != null && kudos.length != 0) {
            $.each(kudos, function() {
                $('#feed').addKudo(this);
                $('.timeago').timeago();
            });
            $('#feed').append("<div class='more-kudo'><a href='#'>See more &#187;</a></div>");
            $('#feed .more-kudo a').click(function() {
                socket.emit('get', kudos[kudos.length - 1].timestamp, fb_id);
                $('#feed .more-kudo').hide();
                $('#loader').show();
                return false;
            });
            loader.appendTo($('#feed'));
        } else {
            $('#feed').append("<div class='more-kudo'>No more kudos. =/</div>");
        }
    });
    
    // Add new posted kudos to the feed
    socket.on('new-kudo', function(kudo) {
        $('#feed').addKudoPre(kudo);
    });
    
    // Show more kudos
    socket.on('more-kudos', function(kudos, fb_id) {
        var see_more = $('#feed .more-kudo').detach();
        var loader = $('#loader').hide().detach();
        
        if (kudos.length == 0) {
            $('#feed').append("<div class='more-kudo'>No more kudos. =/</div>");
        } else {
        
            $.each(kudos, function() {
                $('#feed').addKudo(this);
            });
            see_more.children('a').unbind('click').bind('click', function() {
                socket.emit('get', kudos[kudos.length - 1].timestamp, fb_id);
                $('#feed .more-kudo').hide();
                $('#loader').show();
                return false;
            });
            see_more.appendTo($('#feed')).show();
            loader.appendTo($('#feed'));
        }
    });
    
    socket.on('publish', function(kudo) {
        publish("Kudos to " + kudo.to + " " + kudo.message, kudo._id);
    });
    
    socket.on('error', function(reason) {
        console.error('Unable to connect Socket.IO', reason);
    });
})();

$.fn.addKudoPre = function(kudo) {
    if (kudo.fb) {
        var new_kudo = $("<div id='" + kudo._id + "' class='kudo'><img src='http://graph.facebook.com/" + kudo.fb.id + "/picture'/><p><strong><a href='" + getProfile(kudo.fb.id) + "'>" + kudo.from + "</a></strong>: Kudos to <strong>" + getLinks(kudo.to, kudo.to_id) + "</strong> " + kudo.message + "</p><span class='timeago' title='" + kudo.timestamp + "'></span></div>").hide();
        new_kudo.prependTo($(this)).slideDown('slow');
    } else {
        var new_kudo = $("<div id='" + kudo._id + "' class='kudo'><img src='/images/" + "5" + ".png' /><p><strong>" + kudo.from + "</strong>: Kudos to <strong>" + kudo.to + "</strong> " + kudo.message + "</p><span class='timeago' title='" + kudo.timestamp + "'></span></div>");
        new_kudo.prependTo($(this)).slideDown('slow');
    }
    $('.timeago').timeago();
}

$.fn.addKudo = function(kudo) {
    if (kudo.fb) {
        $(this).append("<div id='" + kudo._id + "' class='kudo'><img src='http://graph.facebook.com/" + kudo.fb_id + "/picture'/><p><strong><a href='" + getProfile(kudo.fb_id) + "'>" + kudo.from + "</a></strong>: Kudos to <strong>" + getLinks(kudo.to, kudo.to_id) + "</strong> " + kudo.message + "</p><span class='timeago' title='" + kudo.timestamp + "'></span></div>");
    } else {
        $(this).append("<div id='" + kudo._id + "' class='kudo'><img src='/images/" + "5" + ".png' /><p><strong>" + kudo.from + "</strong>: Kudos to <strong>" + kudo.to + "</strong> " + kudo.message + "</p><span class='timeago' title='" + kudo.timestamp + "'></span></div>");
    }
    $('.timeago').timeago();
};
//Math.ceil(Math.random()*4)
function split( val ) {
    return val.split( /,\s*/ );
}

function getLinks(to, to_id) {
    if (to_id == "" || to_id == null) return to;

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
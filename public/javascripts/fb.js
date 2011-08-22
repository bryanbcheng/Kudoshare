var friends = null;
var loggedIn = false;
var select = false;

window.fbAsyncInit = function() {
    FB.init({appId: '174692459266434', status: true, cookie: true,
             xfbml: true});
    
    // If user logged in
    FB.getLoginStatus(function(response) {
        if (response.session) {
            login();
        }
    });

    FB.Event.subscribe('auth.login', function(response) {
        login();
    });
    
    
};
(function() {
    var e = document.createElement('script');
    e.type = 'text/javascript';
    e.src = document.location.protocol +
      '//connect.facebook.net/en_US/all.js';
    e.async = true;
    document.getElementById('fb-root').appendChild(e);
}());

function login() {
    FB.api('me', function(response) {
        //var fp = $('#login-panel').children('.facepile').detach();
        $('#login-panel').html("<img src='http://graph.facebook.com/" + response.username + "/picture'/><h3>" + response.name + "</h3><hr>");
        //$('#login-panel').append(fp);
        loggedIn = response;
        $('#kudo-from').attr('value', response.name);
        $('#fb-post').show();
        $('#filter').show();
        $('#kudo-all').bind('click', function() {
            if (!$(this).hasClass('selected')) {
                var loader = $('#loader').detach();
                $('#feed').empty();
                loader.appendTo($('#feed')).show();
                $('#filter .selected').removeClass('selected');
                $(this).addClass('selected');
                var socket = io.connect();
                socket.emit('all');
                return false;
            }
        });
        $('#kudo-me').bind('click', function() {
            if (!$(this).hasClass('selected')) {
                var loader = $('#loader').detach();
                $('#feed').empty();
                loader.appendTo($('#feed')).show();
                $('#filter .selected').removeClass('selected');
                $(this).addClass('selected');
                var socket = io.connect();
                socket.emit('me', response.id);
                return false;
            }
        });
    });
    
    FB.api('/me/friends', function(response) {
        $.each(response.data, function(i, value) {
            value.label = value.name;
        });
        friends = response.data.sort(sortByName);
        $('#kudo-to')
			.bind( "keydown", function( event ) {
				if ( event.keyCode === $.ui.keyCode.TAB &&
						$( this ).data( "autocomplete" ).menu.active ) {
					event.preventDefault();
				} else if ( event.keyCode >= 65 && event.keyCode <= 90 ) {
                    if (select) {
                        this.value = this.value.slice(0 ,-1) + ", ";
                        select = false;
                    }
                }
			})
			.autocomplete({
				minLength: 1,
				source: function( request, response ) {
					response( $.ui.autocomplete.filter( friends, extractLast( request.term ) ).slice(0, 10) );
                },
				focus: function() {
					// prevent value inserted on focus
					return false;
				},
				select: function( event, ui ) {
                    var ids = split( $('#kudo-to-id').attr('value') );
                    if ($('#kudo-to-id').attr('value') == "") ids.pop();
                    ids.push( ui.item.id );
                    $('#kudo-to-id').attr('value', ids.join( ", " ));

					var terms = split( this.value );
					terms.pop();
					terms.push( ui.item.value );
					this.value = terms.join( ", " ) + " ";
                    select = true;
					return false;
				}
			})
            .data( "autocomplete" )._renderItem = function( ul, item ) {
                return $( "<li></li>" )
                    .data( "item.autocomplete", item )
                    .append( "<a><img class='ui-autocomplete-fb-picture' src='" + getImage(item.id) + "'/><span class='ui-autocomplete-label'>" + item.label + "</span></a>" )
                    .appendTo( ul );
            }; 
    });
};

function sortByName(a, b) {
    var x = a.name.toLowerCase();
    var y = b.name.toLowerCase();
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

function getImage(id) {
    return "http://graph.facebook.com/" + id + "/picture";   
}

function split( val ) {
    return val.split( /,\s*/ );
}
function extractLast( term ) {
	return split( term ).pop();
}

function publish(msg) {
    FB.api('/me/feed', 'post', {
        name: 'KudoSHARE',
        message: msg,
        link: 'http://kudoshare.nodester.com',
        picture: 'http://kudoshare.nodester.com/images/logo.png',
        caption: 'Making Thank You Social',
        description: 'Give a well-deserved recognition to your friends, family, or the nice anonymous stranger.'
    });
}
var friends = null;
var loggedIn = false;

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
    var fp = $('#login-panel').children('.facepile').detach();
    FB.api('me', function(response) {
        $('#login-panel').html("<img src='http://graph.facebook.com/" + response.username + "/picture'/><h3>" + response.name + "</h3><hr>");
        $('#login-panel').append(fp);
        loggedIn = response;
        $('#kudo-from').attr('value', response.name);
    });
    
    FB.api('/me/friends', function(response) {
        $.each(response.data, function(i, value) {
            value.label = value.name;
        });
        friends = response.data;
        var select = false;
        $('#kudo-to')
			.bind( "keydown", function( event ) {
				if ( event.keyCode === $.ui.keyCode.TAB &&
						$( this ).data( "autocomplete" ).menu.active ) {
					event.preventDefault();
				} else if ( event.keyCode >= 65 || event.keyCode <= 90 ) {
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
        picture: 'https://fbcdn-photos-a.akamaihd.net/photos-ak-snc1/v43/18/174692459266434/app_1_174692459266434_5640.gif',
        caption: 'Making Thank You Social',
        description: 'Need description =/.'
    });
}
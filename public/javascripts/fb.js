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
        friends = response.data;
    });
};

function publish(msg) {
    FB.api('/me/feed', 'post', {
        name: 'KudoSHARE',
        message: msg,
        picture: 'https://fbcdn-photos-a.akamaihd.net/photos-ak-snc1/v43/18/174692459266434/app_1_174692459266434_5640.gif',
        caption: 'Making Thank You Social',
        description: 'Need description =/.'
    });
/*
FB.ui(
   {
     method: 'feed',
     app_id: '174692459266434',
     name: 'KudoSHARE',
     display: 'popup',
     picture: 'http://localhost:8888/images/logo.png',
     caption: 'Making Thank You Social',
     description: 'Need description =/.'
   }
 );*/
}
var friends = null;

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
        $('#login-panel').html("<img src='https://graph.facebook.com/" + response.username + "/picture'/><h3>" + response.name + "</h3");
        $('#kudo-from').attr('value', response.name);
    });
        
    FB.api('/me/friends', function(response) {
        friends = response.data;
    });
};

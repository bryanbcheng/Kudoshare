(function() {
    $('#kudoform').get(0).reset();
    
    $('#kudo-from, #kudo-to').each(function() {
        var default_value = $(this).attr('value');
        $(this).focus(function() {
            $(this).clearMessage(default_value);
        });
        $(this).blur(function() {
            $(this).setMessage(default_value);
        });
    });


    $('#kudoshare-button').click(function() {
        var socket = io.connect();

        socket.emit('post', { from: $('#kudo-from').attr('value'), to: $('#kudo-to').attr('value'), message: $('#kudo-message').attr('value'), fb: loggedIn });
        
        publish("Kudos to " + $('#kudo-to').attr('value') + " for " + $('#kudo-message').attr('value'));
        $('#kudoform').get(0).reset();
        return false;
    });
    
    $.fn.clearMessage = function(msg) {
        if ($(this).attr("value") == msg)
            $(this).attr("value", "");
    }

    $.fn.setMessage = function(msg) {
        if ($(this).attr("value") == "")
            $(this).attr("value", msg);
    }

})();
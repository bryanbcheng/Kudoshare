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

        if (loggedIn && $('#kudo-to-id').attr('value') != "") {
            socket.emit('post', { from: $('#kudo-from').attr('value'), to: $.trim($('#kudo-to').attr('value')), to_id: $('#kudo-to-id').attr('value'), message: $('#kudo-message').attr('value'), fb: loggedIn });
        } else {
            socket.emit('post', { from: $('#kudo-from').attr('value'), to: $.trim($('#kudo-to').attr('value')), message: $('#kudo-message').attr('value'), fb: loggedIn }, $('#fb-post input[type=checkbox]').is(':checked'));
        }
        
        /*if ($('#fb-post input[type=checkbox]').is(':checked')) {
            //@[562372646:Lionel Cordier]
            publish("Kudos to " + $('#kudo-to').attr('value') + " " + $('#kudo-message').attr('value'));
        }*/
        $('#kudoform').get(0).reset();
        $('#kudo-to-id').attr('value', '');
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
    
    $('#fb-post span').bind('click', function() {
        var $checkbox = $(this).siblings(':checkbox');
        $checkbox.attr('checked', !$checkbox.is(':checked'));
    }).disableSelection();

})();
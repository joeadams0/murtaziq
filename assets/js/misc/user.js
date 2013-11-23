$("#login-button").click(login);

$("#register-button").click(register); 

$("#login-username, #login-password").keypress(function(e) {
    if ( e.which == 13 ) {
        e.preventDefault();
        login(e);
    }
});

$("#register-username, #register-password").keypress(function(e) {
    if ( e.which == 13 ) {
        e.preventDefault();
        register(e);
    }
});

$('.logout-link').click(function(event){
    event.preventDefault();
    $.ajax({
        type : 'GET',
        url : $(this).attr('href'),
        success : function (data, textStatus, jqXHR) {
            window.location.reload();
        },
        error : function(res){
            message("Error: " + res.responseText);
        }
    });
});

function login () {
    var username = $("#login-username").val();
    var password = $("#login-password").val();
    var send = senderGen('/login', username, password);
    if (send) {
        send();
    } else {
        message("A username and password is required");
    }    
 };

 function register (e) {
     e.stopPropagation();
    
    var username = $("#register-username").val();
    var password = $("#register-password").val();
    var confirmPassword = $("#register-confirm-password").val();
    if (password === confirmPassword) {
        var send = senderGen('/register', username, password);
        if(send){
            send();
        } else {
            message("A username and a password is required");
        }   
    } else {
        message("Passwords don't match");
    }  
  };

function senderGen(url, username, password){
    if(username && password && url){
        return function(){
            $.ajax({
                type : 'POST',
                url : url,
                data : {username: username, password:password},
                success : function (data, textStatus, jqXHR) {
                    window.location.reload();
                },
                error : function(res){
                    message("Error: " + res.responseText);
                }
            });
        }
    }
}

function message (mssg) {
    alert(mssg);
}
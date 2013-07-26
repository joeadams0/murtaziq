$("#login-button").click(function(){
        var username = $("#login-username").val();
        var password = $("#login-password").val();
        var send = senderGen('/login', username, password);
        if (send) {
            send();
        } else {
            alert("A username and password is required");
        }
    });

$("#register-button").click(function(){
    var username = $("#register-username").val();
    var password = $("#register-password").val();
    var confirmPassword = $("#register-confirm-password").val();
    if (password === confirmPassword) {
        var send = senderGen('/register', username, password);
        if(send){
            send();
        } else {
            alert("A username and a password is required");
        }   
    } else {
        alert("Passwords don't match");
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
            alert("Error: " + res.responseText);
        }
    });
});

function senderGen(url, username, password){
    if(username && password && url){
        return function(){
            $.ajax({
                type : 'POST',
                url : url,
                data : {username: username, password:password},
                success : function (data, textStatus, jqXHR) {
                    console.log(data);
                    window.location.reload();
                },
                error : function(res){
                    alert("Error: " + res.responseText);
                }
            });
        }
    }
}
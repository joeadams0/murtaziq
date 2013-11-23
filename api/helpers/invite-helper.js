/**
 * User helper - goes in between the controller and model 
 * to accomplish common tasks.
 * 
 **/

var _ = require("underscore");

var sockets = {};

module.exports = {
    
    
    create : function(sender, reciever, done){
                     
        Invite.create({
            senderID: sender, 
    	    recieverID: reciever,
            inviteStatus:'pending',
    	}).done(done); 
    },
};


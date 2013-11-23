/**
 * InviteController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var UserHelper = require("../helpers/user-helper.js");
var utils = require("../../engine/utils.js");
var matchapi = require('../helpers/matchapi.js');

module.exports = {
    
    send : function(req, res){

        var invite = req.body;
        invite.senderID = UserHelper.getSession(req).id; 
        invite.recieverID = req.param("user_id");
        invite.inviteStatus = 'pending';

    	if(!invite.recieverID){
    		res.json("No User Id Specified.");
    	}
        else if(invite.senderID === invite.recieverID){
            res.json("You cannot invite yourself.");
        }
        else if(!UserHelper.getSocket(invite.recieverID)){
            res.json("The user you are trying to invite is not online.");
        }
    	else{
	        var invite = Invite.create(invite).done(function(err, invite){
	            if(err)
	                res.send(err, 500);
	            else if(req.wantsJSON){
                    res.json(invite);
                    UserHelper.getSocket(invite.recieverID).emit('invite', invite);
	            }
	            else {
	                res.view('invite/index', {});
	            }
            });	
	     }
    },

    accept : function(req, res){
        // find the invite and update it to accepted, then create the match
        // var invite = Invite.
    }
};


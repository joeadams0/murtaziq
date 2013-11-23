/**
 * InviteController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var UserHelper = require("../helpers/user-helper.js");
var InviteHelper = require("../helpers/invite-helper.js");
var utils = require("../../engine/utils.js");
var matchapi = require('../helpers/matchapi.js');

module.exports = {
    
    send : function(req, res){
    	var user_id = req.param("user_id");
    	if(!user_id){
    		res.json("No User Id Specified.");
    	}
    	else{
	    	var request = {id : user_id};
	        var invite = InviteHelper.create(UserHelper.getSession(req).id, user_id, function(err, user){
	            if(err)
	                res.send(err, 500);
	            else if(req.wantsJSON){
                    res.json(invite);
	            }
	            else {
	                res.view('invite/index', {});
	            }
            });	
	     }
    }
  
};


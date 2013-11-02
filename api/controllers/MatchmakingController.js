/**
 * MatchmakingController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var UserHelper = require("../helpers/user-helper.js");
var utils = require("../../engine/utils.js");

module.exports = {
    
    index : function(req, res){
	
		User.findOne({id: UserHelper.getSession(req).id}).done(function(err, user) {
		
			res.view('play/matchmaking', {currentUser : user.username});
		})
	}
};

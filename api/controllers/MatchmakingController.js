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
		userId = UserHelper.getSession(req).id;
		
		//TODO: update this to only include users in matchmaking queue
		UserHelper.getUsers({ id: { '!': userId }}, function(err, allUsers) {
			User.findOne({id: userId}).done(function(err, user) {
				res.view('play/matchmaking', {currentUser : user.username, users : allUsers});
			})
		});

	}
};

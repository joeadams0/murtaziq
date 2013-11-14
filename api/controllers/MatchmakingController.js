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
		
		UserHelper.getUsers({ id: { '!': userId }}, function(err, allUsers) {
		
			usersInQueue = [];
			//foreach loop solution to joining User and InMatchQueue and querying on inQueue
			//may be able to do this a better way
			allUsers.forEach(function(user) {
				InMatchQueue.findOne({playerId: user.id}).done(function(err, imq){
					if (imq != null && imq.inQueue == true)
					{
						usersInQueue.push(user);
					}
				});
			});
		
			User.findOne({id: userId}).done(function(err, user) {
				res.view('play/matchmaking', {currentUser : user.username, users : usersInQueue});
			})
		});
		
		//Add current user to matchmaking queue
		InMatchQueue.findOne({playerId: userId}).done(function(err, imq){
			if(err) {
				res.send(err, 500);
			} else if(imq) {
				InMatchQueue.update({playerId: userId}, {inQueue: true}, function() {});
			} else {
				InMatchQueue.create({playerId : userId, inQueue : true}).done(function(err,user){});
			}
		});
	},
	
	leave : function(req, res){
		userId = UserHelper.getSession(req).id;
		InMatchQueue.findOne({playerId: userId}).done(function(err, imq){
			if(err) {
				res.send(err, 500);
			} else if(imq) {
				InMatchQueue.update({playerId: userId}, {inQueue: false}, function() {});
			} else {
				InMatchQueue.create({playerId : userId, inQueue : false}).done(function(err,user){});
			}
		});
	},
};

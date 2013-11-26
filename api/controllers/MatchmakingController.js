/**
 * MatchmakingController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var UserHelper = require("../helpers/user-helper.js");
var utils = require("../../engine/utils.js");
var winston = require('winston');

//Socket to listen for disconnect
var express = require('express');
var http = require('http');
var app = express()
	, server = http.createServer(app)
	, io = require('socket.io').listen(server);
server.listen(1337);

var userIds = [];

//HACK
var userIdAwaitingSocket = 0;

io.on('connection', function(client){
	userIds[client.id] = userIdAwaitingSocket;
	addUserToMatchmaking(userIds[client.id]);
	
	client.on('disconnect', function(){
		removeUserFromMatchmaking(userIds[client.id]);
	}); 
});

function addUserToMatchmaking(userId)
{
	InMatchQueue.findOne({playerId: userId}).done(function(err, imq){
		if(err) {
			res.send(err, 500);
		} else if(imq) {
			InMatchQueue.update({playerId: userId}, {inQueue: true}, function() {});
			winston.info("ID:" + userId + " joined matchmaking.");
		} else {
			InMatchQueue.create({playerId : userId, inQueue : true}).done(function(err,user){});
			winston.info("ID:" + userId + " joined matchmaking.");
		}
	});
}

function removeUserFromMatchmaking(userId)
{
	InMatchQueue.findOne({playerId: userId}).done(function(err, imq){
		if(err) {
			res.send(err, 500);
		} else if(imq) {
			InMatchQueue.update({playerId: userId}, {inQueue: false}, function() {});
			winston.info("ID:" + userId + " left matchmaking.");
		} else {
			InMatchQueue.create({playerId : userId, inQueue : false}).done(function(err,user){});
			winston.info("ID:" + userId + " left matchmaking.");
		}
	});
}

module.exports = {
    
    index : function(req, res){
		userId = UserHelper.getSession(req).id;
		userIdAwaitingSocket = userId;
		
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
	},
};

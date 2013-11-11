
var _ = require("underscore");
var chatHelper = {};

chatHelper.create = function(cb) {
	Chat.create({}).done(function(err, chat) {
		cb(chat);
	});
};

chatHelper.join = function(id, username, socket, cb) {
	if(!id)
		cb(makeStatus(false, "Chat Id not specified."));
	else{
		var status;
		Chat.findOne(id).done(function(err, chat) {
			if(err){
				status = makeStatus(false, err);
				cb(status);
			}
			else{
				Chat.subscribe(socket, id);
				if(!chat.members[username] || chat.members[username].length == 0){
					chat.members[username] = [username];
					chat.save(function(err) {
						if(err)
							status = makeStatus(false, err);
						else{
							chatHelper.broadcast('join', id, username);
							status = makeStatus(true);
						}
						cb(status);
					});
				}
				else
					cb(makeStatus(true));
			}
		});
	}
};

chatHelper.leave = function(id, username, socket, cb) {
	if(!id)
		cb(makeStatus(false, "Chat Id not specified."));
	else{
		var status;
		Chat.findOne(id).done(function(err, chat) {
			if(err){
				status = makeStatus(false, err);
				cb(status);
			}
			else{
				Chat.unsubscribe(socket, id);
				if(chat.members[username]){
					chat.members[username].pop();
					chat.save(function(err) {
						if(err)
							status = makeStatus(false, err);
						else{
							if(_.size(chat.members[username]) == 0)
								chatHelper.broadcast('leave', id, username);
							status = makeStatus(true);
						}
						cb(status);
					});
				}
				else
					cb(makeStatus(false, "User is not a member of this chat."));
			}
		});
	}
};

chatHelper.post = function(id, username, message, cb) {
	if(!id)
		cb(makeStatus(false, "Chat Id not specified."));

	else{
		var status;
		Chat.findOne(id).done(function(err, chat) {
			if(err){
				status = makeStatus(false, err);
				cb(status);
			}
			else{
				if(chat.members[username] && _.size(chat.members[username]) > 0){
					chatHelper.broadcast('post', id, {
						username : username, 
						message : message
					});
					cb(makeStatus(true));
				}
				else
					cb(makeStatus(false, "User is not a member of this chat."));
			}
		});
	}
	cb();
};

chatHelper.broadcast = function (event, id, message){
	sails.io.sockets.in(Chat.room(id)).emit("chat", {
		id : id,
		event : event,
		message : message
	});
};

function makeStatus (success, data) {
	return {
		success : success,
		data : data
	};
}



module.exports = chatHelper;
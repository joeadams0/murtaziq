// Ranked and unranked queues
var unranked = [];
var ranked = [];
var running = false;

module.exports = {	
	addUser : function(user, socket, isRanked){
		if(isRanked && running)
			if(!existUser(ranked, user))
				ranked.push(createQueueUser(user, socket));
		else
			if(!existUser(unranked, user))
				unranked.push(createQueueUser(user, socket));
	},
	removeUser : function(user, socket){
		ranked = _.reject(
				ranked, 
				objComparator(_.isEqual, createQueueUser(user, socket))
			);
		unranked = _.reject(
				unranked, 
				objComparator(_.isEqual, createQueueUser(user, socket))
			);
	},
	start : function(){
		running = true;
	},
	stop : function(){
		running = false;
	}
}

function createQueueUser (user, socket){
	user.socket = socket;
	return user;
}

function existUser (collection, user){
	return _.contains(_.)
}

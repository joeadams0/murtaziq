/*---------------------
	:: Friend 
	-> controller
---------------------*/
var FriendController = {

	findAll : function(req, res){
		Friend.findAll(req.session.userId).done(function(err, friends){
			if (err) return res.send(err,500);
			else if (!friends) return res.send('No Friends :(', 404);
			else{
				res.send(friends);
			}

		});
	},

	create : function(req, res){
		var user2Id = req.param('id');
		if(user2Id && user2Id != req.session.userId){
			var newFriend = {
				user1Id : req.session.userId, 
				user2Id : user2Id
			};

			// Check to see if it already exists
			Friend.find(newFriend).done(function(err, friend){
				if(err){
					res.send(500, {error : 'DB Error'});
				}
				else if(friend){
					res.send(400, {error : 'You are already friends with that user'});
				}
				else {
					Friend.create(newFriend).done(function(err, friend){
						if(err){
							res.send(500, {error : 'DB Error'});
						}
						else {
							res.send({
								friend : friend
							});
						}
					});
				}
			});
		}
		else{
			res.send(400, {error : 'You cannot be friends with yourself'});
		}
	}

};
module.exports = FriendController;
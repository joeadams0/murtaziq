window.profile = {};

profile.getProfile = function (userId, cb) {
	profile.getUser(userId, function(user) {
		var data = {};
		data.user = user;
		profile.getWins(user.id, function(wins) {
			data.wins = wins;
			profile.getLosses(user.id, function(losses) {
				data.losses = losses;
				profile.getStalemates(userId, function(stalemates) {
					data.stalemates = stalemates;
					profile.getLastNMatches(user.id, 25, function(matches) {
						data.matches = matches;
						cb(data);
					});
				});
			});
		});
	});
};

profile.getUser = function(userId, cb) {
	if(!profile.users)
		profile.users = {};
	if(userId <=0 ){
		cb();
	}
	else if(profile.users[userId])
		cb(profile.users[userId]);
	else
		mapi.getUser(userId, function(user) {
			profile.users[userId] = user;
			cb(user);
		});
};

profile.getWins = function(userId, cb) {
	mapi.getWins(userId, cb);
};

profile.getLosses = function(userId, cb) {
	mapi.getLosses(userId, cb);
};

profile.getStalemates = function(userId, cb) {
	mapi.getStalemates(userId, cb);
};

profile.getLastNMatches = function(userId, n, cb){
	mapi.findMatches({
		limit: n,
		where : {
			or : [
				{lightPlayer : userId},
				{darkPlayer : userId}
			],
			state : "matchover"
		}
	}, function(matches) {
		var loop = function(matches, cb){
			if(!matches || _.size(matches)<=0)
				cb([]);
			else if(_.isArray(matches)){
				loop(_.last(matches), function(match) {
					loop(_.initial(matches), function(matches) {
						matches.push(match);
						cb(matches);
					});
				});
			}
			else{
				profile.getUser(matches.lightPlayer, function(lightPlayer) {
					matches.lightPlayer = lightPlayer;
					profile.getUser(matches.darkPlayer, function(darkPlayer) {
						matches.darkPlayer = darkPlayer;
						profile.getUser(matches.winner, function(winner){
							if(winner)
								matches.winner = winner;
							cb(matches);
						});
					});
				});
			}
		};
		loop(matches, cb);
	});
};

profile.render = function(data, $el, cb) {
	if(!cb)
		cb = function() {};
	if(!profile.template){
		require.config({
		    urlArgs: "bust=" + (new Date()).getTime(),
		    baseUrl: "/"
		});
		require([
			"text!/templates/profile/profile.ejs"
		], 
		
		function(template) {
  			profile.template = template;
  			console.log(template);
  			console.log(data);
  			var html = new EJS({text : template}).render(data);
  			$el.html(html);
  			$(".username").on('click', function() { 				
				var id = $(this).attr("user-id");
				window.open("/user/"+id, '_blank');
  			});
  		});
	}
};

$(document).ready(function(){
	
	var host = 'http://localhost:1337';

	var socket = io.connect(host);


	socket.on('connect', function() {

		window.createMApi(socket);
		
	
		profile.getProfile(userId, function(data) {
			profile.render(data, $("#profile"));
		});
	});
});

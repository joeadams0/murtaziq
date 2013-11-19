define([
	"text!templates/mainmenu/mainmenu.ejs",
	"text!templates/mainmenu/joinablematches.ejs"
], function(template, joinableMatchesTemplate) {
	var mainmenu = {};


	mainmenu.state = {};

	mainmenu.load = function(data, cb) {
		$("body").removeAttr("style");
		$("body").removeAttr("class");
		$(".modal-backdrop").remove();
		mainmenu.state.$el = $(new EJS({text : template}).render(data));
		mainmenu.state.$el.appendTo("#" + game.config.container);
		mainmenu.bind();
		mainmenu.showJoinableMatches();
		cb();
	};

	mainmenu.unload = function() {
		mainmenu.state.$el.remove();
	};

	mainmenu.showJoinableMatches = function() {
		mapi.getLobbyMatches(function(status) {
			if(status.success){
				mainmenu.getMatchHost(status.data, function(matches) {
					$("#joinable-matches").html(new EJS({
						text : joinableMatchesTemplate
					}).render({
						matches : matches
					}));
					$(".join-match").on("click", mainmenu.joinMatch);
					$("#main-menu .refresh-matches").on("click", mainmenu.showJoinableMatches);
				});
			}
			else
				alert(status.data);
		});
	};

	mainmenu.getMatchHost = function(matches, cb){
		if(!matches || _.size(matches) == 0)
			cb([]);
		else if(_.isArray(matches)){
			mainmenu.getMatchHost(_.last(matches), function(match) {
				mainmenu.getMatchHost(_.initial(matches), function(matches) {
					matches.push(match);
					cb(matches);
				});
			});
		}
		else{
			mapi.getUser(matches.host, function(user) {
				matches.host = user;
				cb(matches);
			});
		}
	};

	mainmenu.bind = function() {
		$("#create-match").on("click", mainmenu.createMatch);
	};

	mainmenu.createMatch = function() {
		$("#create-match").button('loading');
		window.mapi.createMatch({
	      playerId : game.state.user.id
	    }, function(status) {
			$("#create-match").button('reset');
	      if(status.success){
	        if(status.success){
	        	game.switchState("lobby", status.data);
	        }
	        else
	        	alert(status.data);
	      }
	    });
	};

	mainmenu.joinMatch = function(){
		$(".join-match").button('loading');
	    var matchId = $(this).attr('match-id');

	    window.mapi.joinMatch({
	      matchId : Number(matchId)
	    }, function(status) {
			$(".join-match").button('reset');
	      if(status.success){
	      	switch(status.data.state){
	      		case "lobby":
	        		game.switchState("lobby", status.data);	
	        		break;
	        	case "pieceSelection":
	        		game.switchState("pieceSelection", status.data);
	        		break;
	        	case "playing":
	        		game.switchState("match", status.data);
	        		break;
	      	}
	      	
	      }
	      else
	      	alert(status.data);
	    });
  	};

	return mainmenu;
});
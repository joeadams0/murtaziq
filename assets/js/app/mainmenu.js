define(["text!templates/mainmenu.ejs"], function(template) {
	var mainmenu = {};


	mainmenu.state = {};

	mainmenu.load = function(data, cb) {
		mainmenu.state.$el = $(new EJS({text : template}).render({baller : "hey"}));
		mainmenu.state.$el.appendTo("#" + game.config.container);
		mainmenu.bind();
		cb();
	};

	mainmenu.unload = function() {
		mainmenu.state.$el.hide();
	};

	mainmenu.render = function(cb) {

	};

	mainmenu.bind = function() {
		$("#create-match").on("click", mainmenu.createMatch);
	};

	mainmenu.createMatch = function() {
		window.mapi.createMatch({
	      playerId : game.user.id
	    }, function(status) {
	      if(status.success){
	        match.state.model.thisPlayer = Number(playerId);
	        match.events.newMatch(status.data);
	      }
	    });
	};

	return mainmenu;
});
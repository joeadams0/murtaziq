define(["text!templates/mainmenu.ejs"], function(template) {
	var mainmenu = {};


	mainmenu.state = {};

	mainmenu.load = function(data, cb) {
		mainmenu.state.$el = $(new EJS({text : template}).render(data));
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
	      playerId : game.state.user.id
	    }, function(status) {
	      if(status.success){
	        if(status.success){
	        	game.switchState("lobby", status.data);
	        }
	        else
	        	alert(status.data);
	      }
	    });
	};

	return mainmenu;
});
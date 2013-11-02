

define([], function() {

	var configs = {};
	
	configs.states = {}; 
	configs.states.match = "/js/app/match.js";
	configs.states.mainmenu = "/js/app/mainmenu.js";

	configs.startingState = "mainmenu";
	configs.container = "game";
	return configs;
});
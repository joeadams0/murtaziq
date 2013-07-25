// Filename: router.js 

define([ 

	'backbone', 
	'views/menus/main'


], function(B, MainMenu) { 

	var AppRouter = Backbone.Router.extend({ 

		routes: { 
			// Define some URL routes 
			'mainmenu': 'mainMenu', 
			
			// Default 
			'*actions': 'defaultAction' 
		} 

	}); 

	var initialize = function(){ 
		var appRouter = new AppRouter; 
		appRouter.on('route:mainMenu', function(){ 
			var mainMenu = new MainMenu(); 
			mainMenu.render(); 
		});
		
		appRouter.on('defaultAction', function(actions){ 
			// We have no matching route, lets just log what the URL was 
			console.log('No route:', actions); 
		}); 

		Backbone.history.start();

		return appRouter; 
	}; 

	return { 
		initialize: initialize 
	}; 
}); 

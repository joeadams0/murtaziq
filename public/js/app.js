define([ 
	'backbone', 
	'router', 
], function(Backbone, Router){ 
	var initialize = function(){ 
		var router = Router.initialize(); 
		router.navigate('mainmenu', {trigger : true});
	} 

	return { 
		initialize: initialize 
	}; 
}); 

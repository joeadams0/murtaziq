require.config({ 
	baseUrl : '/js/app/',

	paths: {  
		backbone: 'libs/backbone/backbone',
		text : 'libs/text/text' 
	},
	
	urlArgs: "bust=" +  (new Date()).getTime() 
}); 
require([ 
	'app', 

], function(App){ 
	App.initialize(); 
}); 

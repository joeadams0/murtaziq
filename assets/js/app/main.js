require.config({ 
	baseUrl : '/js/app/',

	paths: {  
		backbone: 'libs/backbone/backbone',
		text : 'libs/text/text' 
	} 
}); 

require([ 
	'app', 

], function(App){ 
	App.initialize(); 
}); 

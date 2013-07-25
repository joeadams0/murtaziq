require.config({ 
	baseUrl : '/js/',

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

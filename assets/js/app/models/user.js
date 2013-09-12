define([ 

	"backbone" 

], function(){ 
	var User = Backbone.Model.extend({ 
		url : '/user',
		defaults: { 
			username: "Harry Potter",
			userId : 0
		} 
	}); 
	return User; 
}); 

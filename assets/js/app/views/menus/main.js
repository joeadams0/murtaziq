
	console.log('here');
define([ 

	'backbone',
	'models/user',
	'text!templates/user.html'

], function(B, User, UserTemplate){

	var MainMenu = Backbone.View.extend({ 
		el: $('#game-content'), 

		render: function(){ 
			var data = {}; 
			var user = new User();
			var element = this.$el;

			user.fetch({
				success : function(){
					var compiledTemplate = _.template( UserTemplate, {
						username : user.get('username'),
						state : user.get('state')
					} );
					element.append(compiledTemplate); 
				}
			});
		},
	});  
	return MainMenu; 
	
}); 

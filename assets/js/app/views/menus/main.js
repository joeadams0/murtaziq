define([ 

	'backbone',
	'views/user',
	'text!templates/mainmenu.html'

], function(B, User, MainMenuTemplate){

	var mainMenu = Backbone.View.extend({ 
		el: $('#game-content'),

		initialize: function(){
			this.user = new User({
				model : this.model
			});
		},

		render: function(){ 
			this.user.render();
			var compiledTemplate = _.template( MainMenuTemplate, {
				title : "Murtaziq"
			} );
			this.$el.append(compiledTemplate); 
		},
	});  
	return mainMenu; 
	
}); 

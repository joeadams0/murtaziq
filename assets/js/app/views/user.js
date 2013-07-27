define([ 

	'backbone',
	'text!templates/user.html'

], function(B, UserTemplate){

	var User = Backbone.View.extend({ 
		el: $('#game-content'), 

		events : {
			'click .find-match-bttn' : 'findMatch'
		},

		initialize: function() {
    		this.listenTo(this.model, "change", this.render);
    		this.user = this.model;
  		},

		render: function(){ 
			var data = {}; 
			var element = this.$el;

			var compiledTemplate = _.template( UserTemplate, {
				username : this.user.get('username'),
				state : this.user.get('state')
			} );
			element.append(compiledTemplate);
		},

		findMatch : function(){
			alert('here');
		}
	});  
	return User; 
	
}); 

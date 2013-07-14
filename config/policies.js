/**
* Policy defines middleware that is run before each controller/controller.
* Any policy dropped into the /middleware directory is made globally available through sails.middleware
* Below, use the string name of the middleware
*/
module.exports.policies = {

	// Default policy (allow public access)
	'*': true,
	'play' : 'authenticated',
	'user' : {
		'*' : 'authenticated',
		register : 'notAuthenticated',
		create : 'notAuthenticated',
		validate : 'notAuthenticated',
		login : 'notAuthenticated'
	},
	'friend' : 'authenticated',
	'match' : {
		'*' : 'authenticated',
		create : false,
		destroy : true,
		update : false,
	}	
	/** Example mapping: 
	someController: {

		// Apply the "authenticated" policy to all actions
		'*': 'authenticated',

		// For someAction, apply 'somePolicy' instead
		someAction: 'somePolicy'
	}
	*/
};
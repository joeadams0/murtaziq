/**
 * Murtaziq API
 */
window.createMApi = function(socket){
	window.mapi = {

		/**
		 * Finds matches that match query
		 * @param  {Object}   params The parameters for the search
		 * @param  {Function} cb     The callback. Passed an array of matches
		 *
		 * See http://youtu.be/GK-tFvpIR7c?t=3m13s for specific params fields.
		 * NOTE: findAll depricated. Use find instead
		 */
		findMatches : function(params, cb) {
			socket.request('/match/find', params, cb);
		},

		/**
		 * Finds one match that matches the ID
		 * @param  {Integer}   id The ID of the match
		 * @param  {Function} cb The callback. Passed the match object
		 * @return {[type]}      [description]
		 */
		findOneMatch : function(id, cb) {
			socket.request('/match/find/'+id, {}, cb);
		},

		createMatch : function(params, cb) {
			socket.request('/match/create', params, cb);
		},

		joinMatch : function(params, cb) {
			socket.request('/match/addPlayer', params, cb);
		},

		setSide : function(params, cb) {
			socket.request('/match/setPlayer', params, cb);
		},

		startMatch : function(params, cb) {
			socket.request("/match/startMatch", params, cb);
		},

		getMoves : function(params, cb) {
			socket.request("/match/getMoves", params, cb);
		},

		performMove : function(params, cb) {
			socket.request("/match/performMove", params, cb);
		},

	};
}


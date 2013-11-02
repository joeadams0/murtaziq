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
		 */
		findOneMatch : function(id, cb) {
			socket.request('/match/find/'+id, {}, cb);
		},

		/**
		 * Creates a match 
		 * @param  {Object}   params The parameters
		 * @param  {Function} cb     The callback, passes in the server status response
		 *
		 * params : {
		 * 		playerId : INTEGER, --> OPTIONAL
		 * }
		 */
		createMatch : function(params, cb) {
			socket.request('/match/create', params, cb);
		},

		/**
		 * Joins a match 
		 * @param  {Object}   params The parameters
		 * @param  {Function} cb     The callback, passes in the server status response
		 *
		 * params : {
		 * 		matchId : INTEGER,
		 * 		playerId : INTEGER
		 * }
		 */
		joinMatch : function(params, cb) {
			socket.request('/match/addPlayer', params, cb);
		},

		/**
		 * Sets the player in the match
		 * @param {Object}   params The Parameters
		 * @param {Function} cb     The callback, passes in the server status response
		 *
		 * params : {
		 * 		matchId : INTEGER,
		 * 		playerId : INTEGER,
		 * 		isLightSide : BOOLEAN --> OPTIONAL
		 * }
		 */	
		setPlayer : function(params, cb) {
			socket.request('/match/setPlayer', params, cb);
		},

		/**
		 * Puts the given match into the lobby state
		 * @param  {Object}   params The parameters
		 * @param  {Function} cb     The callback, passes in the server status response
		 *
		 * params : {
		 * 		matchId : INTEGER
		 * }
		 */
		startMatch : function(params, cb) {
			socket.request("/match/startMatch", params, cb);
		},

		/**
		 * Gets the move for a piece
		 * @param  {Object}   params The parameters
		 * @param  {Function} cb     The callback, passes in the server status response
		 *
		 * params : {
		 * 		matchId : INTEGER,
		 * 		loc : {
		 * 			x : INTEGER,
		 * 			y : INTEGER
		 * 		}
		 * }
		 */
		getMoves : function(params, cb) {
			socket.request("/match/getMoves", params, cb);
		},

		/**
		 * Performs a move
		 * @param  {Object}   params The Parameters
		 * @param  {Function} cb     The callback, passes in the server status response
		 *
		 * params : {
		 * 		matchId : INTEGER,
		 * 		playerId : INTEGER,
		 * 		source : {
		 * 			x : INTEGER,
		 * 			y : INTEGER,
		 * 		},
		 * 		target : {
		 * 			x : INTEGER,
		 * 			y : INTEGER
		 * 		}
		 * }
		 */
		performMove : function(params, cb) {
			socket.request("/match/performMove", params, cb);
		},

	};
}


/**
 * MatchmakingController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var UserHelper = require("../helpers/user-helper.js");

module.exports = {
    
    index : function(req, res){
     
		res.view('play/matchmaking', {currentUser : 1});

    },
    
};

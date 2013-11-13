/**
 * Friendship
 *
 * @module      :: Model
 * @description :: This model contains a userId and another userId to show that two users are friends.
 *
 */

var _ = require('underscore');
module.exports = {

  attributes: {
  	
    playerId1 : {
      type : 'integer',
      defaultsTo : -1
    },
	playerId2 : {
	  type : 'integer',
	  defaultsTo : -1
	},
  }
};

/**
 * InMatchQueue
 *
 * @module      :: Model
 * @description :: This model contains a userId and a boolean to represent if that user is in the queue or not.
 *
 */

var _ = require('underscore');
module.exports = {

  attributes: {
  	
    player : {
      type : 'integer',
      defaultsTo : -1
    },
	inQueue : {
	  type : 'boolean',
	  defaultsTo : false
	},
  }
};

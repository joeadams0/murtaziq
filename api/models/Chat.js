/**
 * Chat
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */

module.exports = {

  attributes: {
  	
  	/* e.g.
  	nickname: 'string'
  	*/    
  },

  beforeCreate :function(values, next) {
    values.members = {};
    next();
  }

};

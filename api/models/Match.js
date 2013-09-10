/**
 * Match
 *
 * @module      :: Model
 * @description :: A short summary of how this model worksa and what it represents.
 *
 */

module.exports = {

  attributes: {
  	
  	lightPlayer : 'integer',
	darkPlayer : 'integer',
	match : 'json'

	toJSON : function(){
		var obj = this.toObject();
		
		return obj;
	}
    
  }

};

/**
 * Match
 *
 * @module      :: Match
 * @description :: Represents the match in the database.
 *
 */

module.exports = {

  attributes: {
  	
    lightPlayer : 'integer',
    darkPlayer : 'integer',
    match : 'json',

    toJSON : function(){
      var obj = this.toObject();

      return obj;
    }
  }

};

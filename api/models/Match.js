/**
 * Match
 *
 * @module      :: Match
 * @description :: Represents the match in the database.
 *
 */

module.exports = {

  attributes: {
  	
    lightPlayer : {
      type : 'integer',
      defaultsTo : -1
    }
    darkPlayer : {
      type : 'integer',
      defaultsTo : -1
    },

    match : {
      type : 'json',
      required : true
    },

    toJSON : function(){
      var obj = this.toObject();

      return obj;
    }
  }

};

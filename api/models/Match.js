/**
 * Match
 *
 * @module      :: Model
 * @description :: This model contains two userIds: lightId, and darkId, pairing them together to indicate that they are in a match together.
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

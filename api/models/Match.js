/**
 * Match
 *
 * @module      :: Model
 * @description :: This model contains two userIds: lightId, and darkId, pairing them together to indicate that they are in a match together.
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

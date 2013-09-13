/**
 * Match
 *
 * @module      :: Model
 * @description :: This model contains two userIds: lightId, and darkId, pairing them together to indicate that they are in a match together.
 *
 */

module.exports = {

    attributes: {
    
        lightId : 'INTEGER',
        
        darkId : 'INTEGER',
        
        match : {
            type : 'JSON',
            required : true
        }
    }
};

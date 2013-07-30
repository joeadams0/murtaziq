/**
 * Match
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
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

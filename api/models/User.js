/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 *
 */

var hasher = require("password-hash");

module.exports = {

    attributes: {
      
        username : {
            type : 'STRING',
            maxLength : 16,
            minLength : 2,
            required : true
        },
        
        
        password : {
           type : 'STRING',
           maxLength : 16,
           minLength : 4,
           required : true
        },
        
        
        state : 'STRING'
    
    },
    
    beforeCreate : function(values, next){
        values.password = hasher.generate(values.password);
        next();
    },
    
    beforeUpdate : function(values, next){
        if(values.password)
            values.password = hasher.generate(values.password);
        next();
    }

};

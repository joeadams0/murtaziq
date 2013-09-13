/**
 * User
 *
 * @module      :: Model
 * @description :: This models users. They have typical fields like usernames, passwords, and roles (admin/user)
 *
 */

var hasher = require("password-hash");
var UserHelper = require("../helpers/user-helper.js");

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
        
        state : 'STRING',
        
        role : {
            type : 'STRING',
            defaultsTo : 'user'
        },
        
        toJSON: function() {
            var obj = this.toObject();
            delete obj.password;
            return obj;
        }
    },
    
    beforeCreate : function(values, next){
        values.password = hasher.generate(values.password);
        next();
    },
    
    beforeUpdate : function(values, next){
        if(values.password)
            values.password = hasher.generate(values.password);
            
        if(values.id)
            delete values.id;
            
        if(values.state)
            values.state = UserHelper.mapState(values.state);
        next();
    }
};

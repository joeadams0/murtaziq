/**
 * Invitation
 *
 * @module      :: Model
 * @description :: This models Invitations for games, the model has sender, receiver, and state
 *
 */

var UserHelper = require("../helpers/user-helper.js");

module.exports = {

    attributes: {
      
        senderID : {
            defaultsTo : -1
        },
        
        recieverID : {
            defaultsTo : -1
        },

        state : 'STRING',
        
        toJSON: function() {
            var obj = this.toObject();
            return obj;
        }
    }
};

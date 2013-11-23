/**
 * Invitation
 *
 * @module      :: Model
 * @description :: This models Invitations for games, the model has sender, receiver, and state
 *
 */

var UserHelper = require("../helpers/user-helper.js");
var InviteHelper = require("../helpers/invite-helper.js");

module.exports = {

    attributes: {
      
        senderID : {
            type : 'integer',
            defaultsTo : -1
        },
        
        recieverID : {
            type : 'integer',
            defaultsTo : -1
        },

        state : 'STRING',
        
        toJSON: function() {
            var obj = this.toObject();
            return obj;
        }
    }
};

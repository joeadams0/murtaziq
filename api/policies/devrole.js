/**
 * Allow any dev user.
 */
var UserHelper = require("../helpers/user-helper.js");
module.exports = function (req, res, ok) {

    UserHelper.getUser(req, function(err, user){
       
        if (user.role == "dev") {
            return ok();
        }
        
        // User is not allowed
        else {
            return res.json("Not Authorized", 401);
        } 
    });
};
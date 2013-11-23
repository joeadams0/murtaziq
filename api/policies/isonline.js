/**
 * Allow any authenticated user.
 */
var UserHelper = require("../helpers/user-helper.js");
module.exports = function (req, res, ok) {
  // User is allowed, proceed to controller
  if (UserHelper.getSocket(UserHelper.getSession(req).id)) {
    ok();
  }

  // User is not allowed
  else {
    return res.json("The user must be online to send an invite.");
  }
};
/**
 * Allow any authenticated user.
 */
var UserHelper = require("../helpers/user-helper.js");
module.exports = function (req, res, ok) {
  // User is allowed, proceed to controller
  if (UserHelper.getSession(req)) {
    ok();
  }

  // User is not allowed
  else {
    return res.redirect('/login');
  }
};
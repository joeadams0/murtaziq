// App bootstrap
// Code to run before launching the app
//
// Make sure you call cb() when you're finished.
module.exports.bootstrap = function (cb) {
	GLOBAL._ = require('underscore');
	GLOBAL.existy = function (x) { return x != null };
	GLOBAL.truthy = function (x) { return (x !== false) && existy(x) };
	GLOBAL.tb = require('../public/common/toolbox.js');
	cb();
};
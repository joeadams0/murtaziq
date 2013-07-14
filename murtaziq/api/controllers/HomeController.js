/*---------------------
	:: Home 
	-> controller
---------------------*/
var HomeController = {

	// To trigger this action locally, visit: `http://localhost:port/home/index`
	index: function (req,res) {
		res.view();
	}

};
module.exports = HomeController;
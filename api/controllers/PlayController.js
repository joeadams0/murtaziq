/*---------------------
	:: Play 
	-> controller
---------------------*/
var PlayController = {

	// To trigger this action locally, visit: `http://localhost:port/play/index`
	index: function (req,res) {
  		res.view({
  			layout: "play_layout",
  			title : "Murtaziq Play"
  		});	
  	},

  	quickMatch : function(req, res){
  		var ranked = false;
  		if(existy(req.param('ranked')))
  			ranked = req.param('ranked');
  		
  	}
};
module.exports = PlayController;
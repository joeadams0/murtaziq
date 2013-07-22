/*---------------------
	:: User 
	-> controller
---------------------*/
var UserController = {

	index: function (req,res) {
		res.send(403, {error : "Invalid Request"});
	},

	login: function (req,res) {
		res.view({title : "Login Murtaziq"});
	},

	register: function (req,res) {
		res.view({title : "Murtaziq Register"});
	},

	create: function (req, res) {
        var username = req.param("username");
        var password = req.param("password");
         
        User.findByUsername(username).done(function(err, usr){
            if (err) {
                res.send(500, { error: "DB Error" });
            } else if (usr) {
                res.send(400, {error: "username already Taken"});
            } else {
                var hasher = require("password-hash");
                password = hasher.generate(password);
                 
                User.create({
	                	username: username, 
	                	password: password,
	                	state: 'online'
	                }).done(function(error, user) {
	                if (error) {
	                    res.send(500, {error: "DB Error"});
	                } else {
	                	setSession(req, user);
	                    res.send({url : '/'});
	                }
            	});
        	}
    	});
	},

	validate: function(req, res) {
		var username = req.param("username");
	    var password = req.param("password");

	    User.findByUsername(username).done(function(err, user) {
	        if (err) {
	            res.send(500, { error: "DB Error" });
	        } else {
	            if (user) {
	                var hasher = require("password-hash");
	                if (hasher.verify(password, user.password)) {
	                	User.update({
	                		username: username 
	                		},{
	                		state: 'online'
	                	});
	                	setSession(req, user);
	                    var data = {url : '/'};
	                    if(req.redirectTo){
	                    	data.url = req.redirectTo;
	                    }
	                    res.send(data);
	                } else {
	                    res.send(400, { error: "Wrong Password" });
	                }
	            } else {
	                res.send(404, { error: "User not Found" });
	            }
	        }
	    }); 
	},

	logout: function(req, res){
		User.update({
			username: getUser(req).username
		},{
			state: 'offline'
		})
		req.session.user = undefined;
		res.redirect('back');
	},

  	user : function(req, res){
  		res.json({user : req.session.user});
  	},
};

function getUser(req){
	return req.session.user;
}

function setSession(req, user){	
    req.session.user = {
    	userId : user.id,
    	username : user.username
    }
}
module.exports = UserController;
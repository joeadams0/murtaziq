/**
 * UserController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {
    
    index : function(req, res){
      res.send(getUser(req));
    },
  
    login : function(req, res){
        var username = req.param("username");
        var password = req.param("password");
        
        if(username && password)
            User.findOne({
                    username : username
                }).done(function(err, user) {
                if (err) {
                    res.send(500, { error: err });
                } else {
                    if (user) {
                        var hasher = require("password-hash");
                        if (hasher.verify(password, user.password)) {
                        
                        	setSession(req, user);
                            var data = getUser(req);
                            res.send(data);
                        } else {
                            res.send(400, { error: "Wrong Username or Password" });
                        }
                    } else {
                        res.send(404, { error: "Wrong Username or Password" });
                    }
                }
            });  
        else
            res.view('user/login', {title : "Login Murtaziq"});
            
    },
    
    create : function(req, res){
        var username = req.param("username");
        var password = req.param("password");
         
        if(username && password)
            User.findOne({
                    
                    username : username
                
                }).done(function(err, user){
                        
                    if (err) {
                        res.send(500, { error: err });
                    } else if (user) {
                        res.send(400, {error: "username already Taken"});
                    } else {
                         
                        User.create({
                            	username: username, 
        	                	password: password,
        	                	state: 'online'
        	                }).done(function(error, user) {
        	                if (error) {
        	                    res.send(500, {error: error});
        	                } else {
        	                	setSession(req, user);
                                res.send(getUser(req));
        	                }
                    	});
                	}
        	});
            
        else
            res.view('user/register', {title : "Login Murtaziq"});
    },
    
    logout : function(req, res){
        removeSession(req);
        res.send({});
    }
};

function getUser(req){
    return req.session.user;
}

function setSession(req, user){	
    User.update({
    	username: user.username 
    	},{
    		state: 'online'
    	},
    	function(err, users){
    		// Nothing yet
    });
    user.password = undefined;
    req.session.user = user;
}

function removeSession(req){
    var user = req.session.user;
    
    User.update({
        id : user.id  
    });
    
    req.session.user = undefined;
}

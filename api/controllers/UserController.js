/**
 * UserController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var UserHelper = require("../helpers/user-helper.js");
var utils = require("../../engine/utils.js");

module.exports = {
    
    index : function(req, res){
    	var user_id = req.param("id") ? req.param("id") : UserHelper.getSession(req).id;
    	var request = {id : user_id};
        UserHelper.getUser(request, function(err, user){
            if(err)
                res.send(err, 500);
            else if(req.wantsJSON){
                res.json(user);
            }
            else
                res.view('user/profile', {currentUser : user});

        });
    },
  
    login : function(req, res){
        var username = req.param("username");
        var password = req.param("password");
        
        if(username && password)
            UserHelper.validate(username, password, 
                function(err){
                    if(err)
                        res.json(err , 500)
                    else{
                        UserHelper.setOnline(req, username, 
                            function(){
                                UserHelper.getUser({username : username}, function(err, user){                                    
                                    res.json(user);
                                }); 
                            });
                    }
                });
        else
            res.view('user/login', {title : "Login Murtaziq"});
            
    },
    
    create : function(req, res){
        var username = req.param("username");
        var password = req.param("password");
         
        if(username && password)
            UserHelper.create(username, password, 
                function(error, user){
                    
                    if (utils.existy(error)) {
                        res.json(error, 500);
                    } else {
                    	UserHelper.setOnline(req, user.username, function(){
                            UserHelper.getUser(req, function(err, user) {
                                res.json("Ok", 200);
                            });
                    	});
                    }
                }
            );
            
        else
            res.view('user/register', {title : "Login Murtaziq"});
    },
    
    logout : function(req, res){
        UserHelper.setOffline(req);
        res.send("Ok", 200);
    },
    
    update : function(req, res){
        var user = req.param("user");
        if(UserHelper.getSession(req).id === user.id)
            UserHelper.update(UserHelper.getSession(req), user, function(err, user){
                if(err)
                    res.json(err, 500);
                else
                    res.json(200);
            });
        else
            res.json("Not Authorized", 401);
    },

    userlist : function(req, res){
	User.find({}).limit(10).sort('name ASC').done(function(err, users) {
		  // Error handling
		  if (err) {
		    return res.json(err);
		  // Found multiple users!
		  } else {
		res.view('user/index', { list : users } )  
		}
		});
    },

    registersocket : function(req, res) {
        if(!req.socket)
          res.json("Need to have a socket to register.");

        UserHelper.registerSocket(UserHelper.getSession(req).id, req.socket, function(status) {
          res.json(status);
        });
    },

    deregistersocket : function(req, res) {
        UserHelper.deregisterSocket(UserHelper.getSession(req).id, function(status) {
          res.json(status);
        });
    },
};

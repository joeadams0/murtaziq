/**
 * UserController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

var UserHelper = require("../helpers/user-helper.js");

module.exports = {
    
    index : function(req, res){
        UserHelper.getUser(req, function(err, user){
            if(err)
                res.send(err, 500);
            else
                res.send(user);
        });
    },
  
    login : function(req, res){
        var username = req.param("username");
        var password = req.param("password");
        
        if(username && password)
            UserHelper.validate(username, password, 
                function(err){
                    if(err)
                        res.send(err , 500)
                    else{
                        UserHelper.setOnline(req, username, 
                            function(){
                                UserHelper.getUser(req, function(err, user){
                                    res.send(user);
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
                    if (error) {
                        res.send(error, 500);
                    } else {
                    	UserHelper.setOnline(req, user);
                        res.send(UserHelper.getSession(req));
                    }
                }
            );
            
        else
            res.view('user/register', {title : "Login Murtaziq"});
    },
    
    logout : function(req, res){
        UserHelper.setOffline(req);
        res.send({});
    },
    
    put : function(req, res){
        var user = req.param("user");
        if(UserHelper.getSession(req).id === user.id)
            UserHelper.update(UserHelper.getSession(req), user, function(err, user){
                res.send(user);
            });
        else
            res.send(401)
    }
};

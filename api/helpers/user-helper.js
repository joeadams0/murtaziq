/**
 * User helper - goes in between the controller and model 
 * to accomplish common tasks.
 * 
 **/

var hasher = require("password-hash");
var _ = require("underscore");
module.exports = {
    
    states : states,
    
    create : function(username, pass, done){
        User.findOne({
                    
                username : username
            
            }).done(function(err, user){
                    
                if (err) {
                    done(err);
                } else if (user) {
                    done("Username already Taken");
                } else 
                     
                    User.create({
                            username: username, 
    	                	password: pass,
    	                	state: states.online
    	                }).done(done); 
            });
    },
    
    validate : function(username, pass, done){
        User.findOne({
                    username : username
                }).done(function(err, user) {
                if (err) {
                    done(err);
                } else {
                    if (user) {
                        if (hasher.verify(pass, user.password)) {
                            done();    
                        } else {
                            done("Wrong Username or Password");
                        }
                    } else {
                        done("Wrong Username or Password");
                    }
                }
            }); 
    },
    
    update : function(cond, newUser, cb){
        var self = this;
        if(newUser.id)
            delete newUser.id;
            
        if(newUser.state)
            newUser.state = this.mapState(newUser.state);

        User.update(cond,
            newUser
            , function(err, users) {
    
                if (err)
                    cb(err, undefined);
                else 
                    cb(err, self.sanitize(users[0]));
            });
    },
    
    getSession : function(req){
        return req.session.user;
    },
    
    setSession : function(req, user){
        req.session.user = {
            id : user.id
        };
    },
    
    getUser : function(req, cb){
        var self = this;
        User.findOne(this.getSession(req), function(err, user){
            if(err)
                cb(err, user);
            else
                cb(err, self.sanitize(user));
        });
    },
    
    setOnline : function(req, username, cb){  
        var self = this;

        this.update({
        	username: username 
        	},{
        		state: states.online
        	},
        	function(err, user){
                self.getUsers({
                    username : username
                },
                function(err, users){
                    self.setSession(req, users[0]);
                    cb();
                });
        });
    },
    
    setOffline : function(req){
        var user = this.getSession(req);
        
        User.update(user, {
            state : states.offline
        });
        
        this.setSession(req, undefined);
    },
    
    getUsers : function(cond, cb){
        var self = this;
        User.find(cond, function(err, users){
            if(err)
                cb(err, users);
            else{
                cb(err, _.map(users, 
                    function(user){
                        return self.sanitize(user);
                    })
                );
            }
        });
    },
    
    sanitize : function(user){
        user.password = undefined;
        return user;
    },
    
    mapState : function(state){
        switch(state){
            case 'offline': 
                return states.offline;
                break;
            case 'mm':
                return states.matchmaking;
                break;
            case 'rmm':
                return states.rankedmatchmaking;
                break;
            default: 
                return states.online;
                
        }
    }
    
}

var states = {
        online : 'online',
        offline : 'offline',
        matchmaking : 'mm',
        rankedmatchmaking : 'rmm'
    };
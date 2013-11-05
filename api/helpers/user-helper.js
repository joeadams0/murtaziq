/**
 * User helper - goes in between the controller and model 
 * to accomplish common tasks.
 * 
 **/

var hasher = require("password-hash");
var _ = require("underscore");

var sockets = {};

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
                            if(!sockets[user.id]){
                                done();
                            }
                            else
                                done("User is already logged on");    
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
        User.update(cond, newUser, cb);
    },
    
    getSession : function(req){
        return req.session.user;
    },
    
    setSession : function(req, user){
        req.session.user = user;
    },
    getUser: function(req, cb){
        User.findOne(req, cb);
    },
    getCurrentUser : function(req, cb){
        User.findOne(this.getSession(req), cb);
    },
    
    setOnline : function(req, username, cb){  
        var self = this;

        this.update({
        	username: username 
        	},{
        		state: states.online
        	},
        	function(err, users){
                self.setSession(req, {id : users[0].id});
                cb();
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
        User.find(cond, cb);
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
    },

    registerSocket : function (id, socket, cb) {
        sockets[id] = socket;
        cb(makeStatus(true, ""));
    },

    deregisterSocket : function (id, cb) {        
        sockets[id] = undefined;
        cb(makeStatus(true, ""));
    },

    getSocket : function (id) {
        return sockets[id];
    },
        
};


function makeStatus (success, data) {
    return {
        success : success,
        data : data
    }
}

var states = {
        online : 'online',
        offline : 'offline',
        matchmaking : 'mm',
        rankedmatchmaking : 'rmm'
    };
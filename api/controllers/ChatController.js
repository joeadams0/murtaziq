/**
 * ChatController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */
var chathelper = require("../helpers/chat-helper.js");
var userhelper = require("../helpers/user-helper.js");

module.exports = {

  /* e.g.
  sayHello: function (req, res) {
    res.send('hello world!');
  }
  */

  create: function(req, res) {
      chathelper.create(function(chat) {
      res.json(chat);
    });
  },

  /**
   * /chat/post
   */ 
  post: function (req, res) {
    var user = userhelper.getSession(req);
    var id = req.body.chatId;
    var message = req.body.message;

    chathelper.post(id, user.username, message, function(status) {
      res.json(status);
    });
  },


  /**
   * /chat/join
   */ 
  join: function (req,res) {
    var user = userhelper.getSession(req);
    var id = req.body.chatId;

    chathelper.join(id, user.username, req.socket, function(status) {
      res.json(status);
    });
  },

  /**
   * /chat/leave
   */ 
  leave: function (req,res) {
    var user = userhelper.getSession(req);
    var id = req.body.chatId;

    chathelper.leave(id, user.username, req.socket, function(status) {
      res.json(status);
    });
  }

};

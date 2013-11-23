/**
 * Match
 *
 * @module      :: Model
 * @description :: This model contains two userIds: lightId, and darkId, pairing them together to indicate that they are in a match together.
 *
 */
var match = require('../../engine/match.js');
var _ = require('underscore');
var chathelper = require("../helpers/chat-helper.js");
module.exports = {

  attributes: {
  	
    lightPlayer : {
      defaultsTo : -1
    },
    darkPlayer : {
      defaultsTo : -1
    },

    winner : {
      defaultsTo : -1
    },

    host : {
      defaultsTo : -1
    },

    state : {
      type : 'string',
      defaultsTo : 'lobby'
    },

    observers : {
      type : 'array',
      defaultsTo : [ ]
    },

    getStates : function() {
      return {
        lobby : 'lobby',
        pieceSelection : 'pieceSelection',
        playing : 'playing',
        over : "matchover"
      }
    },


    loadedMatch : function() {
      return match.loadJSONObj(this.match);
    },

    toJSON : function(){
      var obj = this.toObject();
      obj.match = match.toClientJSONObj(this.loadedMatch());
      return obj;
    },

  },

  beforeCreate : function(values, next){
    if(!values.match){
      values.match = match.toJSONObj(match.create());
    }
    chathelper.create(function(lobbyChat) {
      values.lobbyChat = lobbyChat.id;
      chathelper.create(function(playerChat) {
        values.playerChat = playerChat.id;
        next();
      });
    }); 
  },
};

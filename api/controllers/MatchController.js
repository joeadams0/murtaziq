/**
 * MatchController
 *
 * @module		:: Match Controller
 * @description	:: Contains logic for handling requests about matches.
 */

var matchapi = require('../helpers/matchapi.js');
var UserHelper = require('../helpers/user-helper.js');

module.exports = {

  index : function(req, res) {
    var matchId = req.param("matchId");
    if(req.wantsJSON){
      matchapi.getMatch(matchId, function(err, match) {
        if(err)
          res.json({
            success: false,
            data : err,
          });
        else{
          res.json({
            success : true,
            data : match
          });
        }
      });
    }
    else{      
      if(!matchId){
        res.view({
          layout : 'play-layout',
          title : 'Play Murtaziq',
          hasMatchId : false
        });
      }
      else{
        res.view({
          layout : 'play-layout',
          title : 'Play Murtaziq',
          matchId : matchId,
          hasMatchId : true
        });
      }
    }
  },

  /**
   * /match/create
   */ 
  create: function (req,res) {
    delete req.body.id;

    req.body.playerId = UserHelper.getSession(req).id;
    matchapi.create(req.body, function(status) {
        if(status.success)
          matchapi.subscribeSocket(status.data.id, req.socket);
        res.json(status);
    });
  },

  /**
   * Adds a player to the specified match, then publishes match to all subscribers
   * Adds it to the next open position with the following precidence:
   *   1) Light Player
   *   2) Dark Player
   *   3) Observer
   * @param {Object} req request
   * @param {Object} res response
   *
   * Note: message body must contain the following fields:
   * {
   *   matchId : INTEGER
   * }
   */
  addPlayer : function(req, res) {
    if(req.param('id'))
      req.body.matchId = req.param('id');


    req.body.playerId = UserHelper.getSession(req).id;
    matchapi.addPlayer(req.body, function(status) {

      if(status.success){
        Match.publishUpdate(status.data.id, status.data);
        matchapi.subscribeSocket(req.body.matchId, req.socket);
      }
      
      res.json(status);
    });
  },

  destroy : function(req, res) {
    if(req.param('id'))
      req.body.matchId = req.param('id');

    req.body.playerId = UserHelper.getSession(req).id;

    matchapi.destroy(req.body, function(status) {
      if(status.success){
        Match.publishDestroy(req.body.matchId);
      }
      res.json(status);
    });
  },

  /**
   * Sets the player to the specified role in the match
   * @param {Object} req request
   * @param {Object} res response
   *
   * Note: message body must contain the following fields:
   * {
   *   matchId : INTEGER,
   *   side : INTEGER 
   * }
   */
  setPlayer : function(req, res) {
    if(req.param('id'))
      req.body.matchId = req.param('id');   


    req.body.playerId = UserHelper.getSession(req).id;
    matchapi.setPlayer(req.body, function(status) {
      if(status.success){
        Match.publishUpdate(status.data.id, status.data);
      }
      res.json(status);
    });
  },

  removePlayer : function(req, res) {
    if(req.param('id'))
      req.body.matchId = req.param('id');


    req.body.playerId = UserHelper.getSession(req).id;
    matchapi.removePlayer(req.body, function(status) {
      if(status.success){
        matchapi.unsubscribeSocket(status.data.id, req.socket);
        Match.publishUpdate(status.data.id, status.data);
      }

      res.json(status);
    }); 
  },

  setPieces : function(req, res) {
    if(req.param('id'))
      req.body.matchId = req.param('id');   


    req.body.playerId = UserHelper.getSession(req).id;
    matchapi.setPieces(req.body, function(status) {
      if(status.success){
        matchapi.getMatch(req.body.matchId, function(err, match) {
          if(!err)
            Match.publishUpdate(req.body.matchId, match);      
        });
      }

      res.json(status); 
    });
  },

  getMoves : function(req, res) {
    if(req.param('id'))
      req.body.matchId = req.param('id');   


    req.body.playerId = UserHelper.getSession(req).id;
    matchapi.getMoves(req.body, function(status) {
      res.json(status);
    });
  },

  getLobbyMatches : function(req, res) {
    matchapi.getMatches({
      where : {
        state : "lobby"
      },
      limit : 10
    }, function(err, matches) {
      if(err)
        res.json({
          success : false,
          data : err
        });
      else
        res.json({
          success : true,
          data : matches
        });
    });
  },

  surrender : function(req, res) {
    if(req.param('id'))
      req.body.matchId = req.param('id');  


    req.body.playerId = UserHelper.getSession(req).id;
    matchapi.surrender(req.body, function(status) {
      if(status.success)
        Match.publishUpdate(status.data.id, status.data);
      res.json(status);
    });
  },

  startMatch : function(req, res) {
    var id;
    if(req.param('id'))
      id = req.param('id'); 
    else
      id = req.body.id; 


    req.body.playerId = UserHelper.getSession(req).id;
    matchapi.startMatch(id, function(status) {
      if(status.success)
        Match.publishUpdate(status.data.id, status.data);
      res.json(status);
    });
  },

  getAllPieces : function(req, res) {
    res.json(matchapi.getAllPieces());
  },

  getMaxTeamValue : function(req, res) {
    res.json(matchapi.getMaxTeamValue());
  },

  performMove : function(req, res) {
    if(req.param('id'))
      req.body.matchId = req.param('id');  


    req.body.playerId = UserHelper.getSession(req).id;
    matchapi.performMove(req.body, function(status) {
      if(status.success)
        Match.publishUpdate(status.data.id, status.data);
      res.json(status);
    });
  },

  setHost : function(req, res) {
    if(req.param('id'))
      req.body.matchId = req.param('id');  

    
    req.body.playerId = UserHelper.getSession(req).id;
    matchapi.setHost(req.body, function(status) {
      if(status.success)
        Match.publishUpdate(status.data.id, status.data);
      res.json(status);
    });
  },
};

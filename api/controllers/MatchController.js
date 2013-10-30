/**
 * MatchController
 *
 * @module		:: Match Controller
 * @description	:: Contains logic for handling requests about matches.
 */

var matchapi = require('../helpers/matchapi.js');

module.exports = {


  /**
   * /match/create
   */ 
  create: function (req,res) {
    delete req.body.id;

    matchapi.create(req.body, function(status) {
        if(status.success)
          matchapi.subscribeSocket(status.data.id, req.socket);
        res.json(status);
    });
  },

  addPlayer : function(req, res) {
    if(req.param('id'))
      req.body.matchId = req.param('id');

    matchapi.addPlayer(req.body, function(status) {

      if(status.success){
        Match.publishUpdate(status.data.id, status.data);
        matchapi.subscribeSocket(req.body.matchId, req.socket);
      }
      
      res.json(status);
    });
  },

  setPlayer : function(req, res) {
    if(req.param('id'))
      req.body.matchId = req.param('id');   

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

    matchapi.setPieces(req.body, function(status) {
      if(status.success)
        Match.publishUpdate(status.data.id, status.data);

      res.json(status); 
    });
  },

  getMoves : function(req, res) {
    if(req.param('id'))
      req.body.matchId = req.param('id');   

    matchapi.getMoves(req.body, function(status) {
      res.json(status);
    });
  },

  surrender : function(req, res) {
    if(req.param('id'))
      req.body.matchId = req.param('id');  

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

    matchapi.performMove(req.body, function(status) {
      if(status.success)
        Match.publishUpdate(status.data.id, status.data);
      res.json(status);
    });
  },

  setHost : function(req, res) {
    if(req.param('id'))
      req.body.matchId = req.param('id');  

    matchapi.setHost(req.body, function(status) {
      if(status.success)
        Match.publishUpdate(status.data.id, status.data);
      res.json(status);
    });
  },
};

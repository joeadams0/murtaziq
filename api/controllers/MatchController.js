/**
 * MatchController
 *
 * @module		:: Match Controller
 * @description	:: Contains logic for handling requests about matches.
 */

module.exports = {

 var matchapi = require('../helpers/matchapi.js');
  /**
   * /match/find
   */ 
  find: function (req,res) {

    // This will render the view: 
    // /home/joe/Dropbox/Programs/murtaziq/views/match/find.ejs
    res.view();

  },


  /**
   * /match/create
   */ 
  create: function (req,res) {
      matchapi.create(function(match) {
          res.json(match.toJSON());
      });

};

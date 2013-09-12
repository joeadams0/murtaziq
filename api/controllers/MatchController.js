/**
 * MatchController
 *
 * @module		:: Match Controller
 * @description	:: Contains logic for handling requests about matches.
 */

module.exports = {

 
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

    // This will render the view: 
    // /home/joe/Dropbox/Programs/murtaziq/views/match/create.ejs
    res.view();

  }

};

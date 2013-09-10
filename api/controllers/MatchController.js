/**
 * MatchController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

  /* e.g.
  sayHello: function (req, res) {
    res.send('hello world!');
  }
  */
  
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

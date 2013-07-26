/**
 * PlayController
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
   * /play/index
   */ 
  index: function (req,res) {

    // This will render the view: 
    // /home/joe/Projects/murtaziq/views/play/index.ejs
    res.view({
      layout : 'play-layout',
      title : 'Play Murtaziq'
    });

  }

};

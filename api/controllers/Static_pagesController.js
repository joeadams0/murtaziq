/**
 * Static_pagesController
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
   * /static_pages/stats
   */ 
  stats: function (req,res) {

    // This will render the view: 
    // /home/tenari/sites/joe/views/static_pages/stats.ejs
    res.view('static_pages/stats', {title:"Murtaziq Statistics"});

  }

};

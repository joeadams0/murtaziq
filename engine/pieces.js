/**
 * 
 * pieces.js
 * Abstracts away piece loading
 * 
 * @author Joe Adams
 **/
var configs = require("./config.js");

module.exports = {
    get : get
};

function get(pieceName){
    return configs.pieces[pieceName];
}
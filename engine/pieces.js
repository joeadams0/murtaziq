/**
 * 
 * pieces.js
 * Abstracts away piece loading
 * 
 * @author Joe Adams
 **/

module.exports = {
    get : get
};

function get(configs, pieceName){
    return configs.pieces[pieceName];
}
/**
 * 
 * pieces.js
 * Abstracts away piece loading
 * 
 * @author Joe Adams
 **/
var master;
var utils = require('./utils.js');
var fs = require('fs');
var _ = require('underscore');

module.exports = {
    getConstructor : getConstructor,
    loadPiece : loadPiece,
    getValue : getValue
};

/**
 * Gets a piece constructor by its name
 * @param  {String} pieceName The name of the piece
 * @return {Function}         The piece constructor
 */
function getConstructor(pieceName){
	master = require('./master.js');
	return master.getPieces()[pieceName].init;	
}

function loadPiece(pieceConfig){
	master = require('./master.js');
	return master.getPieces()[pieceConfig.name].loadJSONObj(pieceConfig);
}

function getValue(pieceName){
	master = require('./master.js');
	return master.getPieceConfigs()[pieceName].value;
}



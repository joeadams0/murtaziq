/**
 * 
 * pieces.js
 * Abstracts away piece loading
 * 
 * @author Joe Adams
 **/
var configs = require('./config.0.0.0.js');
var fs = require('fs');
var _ = require('underscore');
var utils = require('./utils.js');
var pieces = {};

module.exports = {
    getConstructor : getConstructor,
    init : init,
    loadPiece : loadPiece
};

/**
 * Gets a piece constructor by its name
 * @param  {String} pieceName The name of the piece
 * @return {Function}         The piece constructor
 */
function getConstructor(pieceName){
	return pieces[pieceName].init;	
}

function loadPiece(pieceConfig, config){
	return pieces[pieceConfig.name].loadJSONObj(pieceConfig, config);
}

function init(cb){
	if(_.isEmpty(pieces))
		load(cb)
	else
		cb();
}

/**
 * Loads the pieces
 * @param  {Function} cb The callback function
 */
function load(cb){
	fs.readdir(configs.pieceConfigDir, function(err, files){
		if(err)
			throw err;
		else
			_.each(files, function(file, index){
				var path = utils.appendPath(configs.pieceConfigDir,file);

				if(fs.lstatSync(path).isFile()){

					var config = require(path);

					var piece = require(utils.appendPath(configs.pieceDir, config.file ? config.file : 'piece.js'));


					pieces[config.name] = {
						init : piece.init(config),
						loadJSONObj : piece.loadJSONObj
					};

					if(index===(_.size(files)-1))
						cb();
				}

			});
	});
}


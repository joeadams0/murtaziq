var configDir = './config';
var version = '0.0.0';
var pieceConfigDir = './config/pieces';
var pieceDir = './pieces';
var schemaDir = './schemas';
var movesDir = './moves';
var pieces;

var utils = require('./utils.js');
var configs = require(configDir + '/config.' + version + '.js');
var fs = require('fs');
var _ = require('underscore');

loadPieces();

module.exports = {
    getConfigs : getConfigs,
    getPieces : getPieces,
    getSchema : getSchema,
    getMove : getMove,
    loadPieces : loadPieces,
    schemaDir : schemaDir,
};

function getConfigs () {
    return configs;
}

function getPieces () {
    return pieces;
}

function getSchema (fileName) {
    return require(utils.appendPath(schemaDir, fileName));
}

function getMove (movename) {
    return require(utils.appendPath(movesDir, configs.moves[movename]));
}

/**
 * Loads the pieces
 */
function loadPieces(){
    pieces = {};

    var files = fs.readdirSync(pieceConfigDir);

    _.each(files, function(file, index){
        var path = utils.appendPath(pieceConfigDir, file);

        if(fs.lstatSync(path).isFile()){

            var config = require(path);

            var piece = require(utils.appendPath(pieceDir, config.file ? config.file : 'piece.js'));


            pieces[config.name] = {
                init : piece.init(config),
                loadJSONObj : piece.loadJSONObj
            };
        }

    });
}
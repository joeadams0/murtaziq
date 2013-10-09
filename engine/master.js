
var configDir = './config';
var version = '0.0.0';
var pieceConfigDir = './config/pieces';
var pieceDir = './pieces';
var schemaDir = './schemas';
var movesDir = './moves';
var pieces;
var pieceConfigs;

var utils = require('./utils.js');
var configs = require(configDir + '/config.' + version + '.js');
var fs = require('fs');
var _ = require('underscore');

loadPieces();

module.exports = {
    getConfigs : getConfigs,
    getPieces : getPieces,
    getSchema : getSchema,
    getPieceConfigs : getPieceConfigs,
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

function getPieceConfigs (){
    return pieceConfigs;
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
    pieceConfigs = {};

    var files = fs.readdirSync(utils.appendPath(__dirname, pieceConfigDir));

    _.each(files, function(file, index){
        var path = utils.appendPath(__dirname, utils.appendPath(pieceConfigDir, file));

        if(fs.lstatSync(path).isFile()){

            var config = require(path);

            var piece = require(utils.appendPath(pieceDir, config.file ? config.file : 'piece.js'));


            pieceConfigs[config.name] = config;
            pieces[config.name] = {
                init : piece.init(config),
                loadJSONObj : piece.loadJSONObj
            };
        }

    });
}
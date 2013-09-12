/**
 * 
 * match.js
 * Match object
 * 
 * @author Joe Adams
 **/
var Chessboard = require("./chessboard.js");
var _ = require("underscore");
var utils = require("./utils.js");
var Vector = require("./vector.js");

module.exports = {
    create : create,
    getTurn : getTurn,
    getBoard : getBoard,
    getMoves : getMoves,
    printBoard : printBoard,
    getPiece : getPiece,
    move : move,
    getConfigs : getConfigs,
    toJSON : toJSON,
    toClientJSON : toClientJSON,
    loadJSON : loadJSON
};

/**
 * Creates the match
 * @param {Object} configs The configurations for the match
 * @param  {Object} lightSide the lightside piece information
 * @param  {Object} darkSide  the darkside piece information
 * @return {Object} match     the match object
 */
function create(configs, cb, lightSide, darkSide){
    Chessboard.create(configs,function(board) {
        cb({
            configs : configs,
            turn : configs.lightTeam,
            board : board,
            history : []
        });
    }, lightSide, darkSide);
        
}

/**
 * Gets the current turn
 * @param  {Object} match The match to get the turn from
 * @return {Integer}       The integer representing either the dark or the light side
 */
function getTurn(match){
    return match.turn;
}

/**
 * Gets the match history
 * @param  {Object} match The match to get the history from
 * @return {Array}       The stack of moves
 */
function getHistory(match){
    return match.history;
}

/**
 * Adds a move to the history
 * @param {Object} match The match to add the move to
 * @param {Object} move  The move to add to the match
 */
function addMove(match, move){
    getHistory(match).push(move);
}

/**
 * Removes the last move from the match history
 * @param  {Object} match The match to remove the move from
 * @return {Object} move  The move
 */
function removeMove(match){
    return getHistory(match.pop());
}

/**
 * Sets the turn of the match
 * @param {Object} match The match to set the turn of
 * @param {Object} turn  
 */
function setTurn(match, turn){
    match.turn = turn;
}

/**
 * Gets the chessboard for the match
 * @param  {Object} match The match to get the board from
 * @return {Object}       The chessboard for the match
 */
function getBoard(match){
    return match.board;
}

/**
 * Gets the moves for a location
 * @param  {Object} match  The current Match
 * @param  {Object} vec    The location on the board to find the moves for
 * @param  {Function} filter The function to filter the moves with
 * @return {Array}        The list of moves
 */
function getMoves(match, vec, filter){
    filter = utils.existy(filter) ? filter : legalMovesFilter;  
    return _.filter(
            Chessboard.getMoves(getBoard(match), Chessboard.getSpace(getBoard(match), vec)),
            filter(match)
        );
}

/**
 * Prints the board
 * @param  {Object} match The match to print the board of
 */
function printBoard(match){
    var args = arguments;
    args[0] = getBoard(match);
    Chessboard.print.apply(Chessboard, args);
}

/**
 * Gets the piece at the location
 * @param  {Object} match The match to use
 * @param  {Object} loc  The location of the piece
 * @return {Object}       The piece
 */
function getPiece(match, loc){
    return Chessboard.getPiece(getBoard(match), loc);
}

/**
 * Moves the piece at loc1 to loc2
 * @param  {Object} match The match
 * @param  {Object} loc1  The source of the move
 * @param  {Object} loc2  The destination of the move
 * @return {Object}       The Match
 */
function move(match, loc1, loc2){
    var board = getBoard(match);
    if(utils.existy(Chessboard.getPiece(getBoard(match), loc1))){
        // Filter out the illgal moves, then find the move to the right location
        var m = _.find(
                        getMoves(match, loc1, canMoveFilter),
                        function(move){
                            return Vector.isEqual(loc2, move.getEndLoc());
                        }
                    );
        if(utils.existy(m)){
            m.perform(board);
            switchTurn(match);
            addMove(match, m);
        }
    }
    return match;
}

/**
 * Switches the turn
 * @param  {Object} match The match 
 */
function switchTurn(match){
    if(getTurn(match) === getConfigs(match).lightTeam)
        setTurn(match, getConfigs(match).darkTeam);
    else
        setTurn(match, getConfigs(match).lightTeam);
}

/**
 * Gets the configs for the match
 * @param  {Object} match The match
 * @return {Object}       The configurations
 */
function getConfigs(match){
    return match.configs;
}

/**
 * Returns a function to filters out impossible moves
 * @param  {Object} match The match to use
 * @return {Function}       The filter for the moves
 */
function canMoveFilter(match){
    var Rules = require("./rules.js");
    return function (move){
        return Rules.canMove(match, move);
    };
}

/**
 * Returns a function which filters out the illigal moves
 * @param  {Object} match The match
 * @return {Fuction}       The filter
 */
function legalMovesFilter(match){
    var Rules = require("./rules.js");
    return function(move){
        return Rules.isLegalMove(getBoard(match), move);
    };
}

/**
 * Returns the match object as a JSON String. 
 * It is a comprehensive JSON String, meaning that the match can be loaded again from the string.
 * @param  {Object} match
 * @return {JSON}
 */
function toJSON(match){
    var JSONObj = {
        configs : getConfigs(match).name,
        turn : getTurn(match),
        board : Chessboard.toJSONObj(getBoard(match)),
        history : _.map(getHistory(match), function(move) {
            return move.toJSONObj();
        })
    };

    return JSON.stringify(JSONObj);
}

/**
 * Returns the match object as a JSON String.
 * The string contains only the information needed to render the match on the client.
 * The match cannot be loaded from this JSON String (For that, see toJSON).
 * @param  {Object} match
 * @return {JSON}
 */
function toClientJSON(match){

}

/**
 * Loads the match from the JSON
 * @param  {JSON} json
 * @return {Object} The Match Object
 */
function loadJSON(json, cb){
    var JSONObj = eval('('+json+')');

    var configs = require(utils.appendPath('./',JSONObj.configs));
    
    Chessboard.loadJSONObj(JSONObj.board, configs, function(board) {
        var match = {
            configs : configs,
            turn : JSONObj.turn,
            board : board,
            history : _.map(JSONObj.history, function(m) {
                var move = require(utils.appendPath(configs.movesDir, m.type));

                return new move(m);
            })
        }

        cb(match);
    });
}

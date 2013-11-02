/**
 * 
 * match.js
 * Match object
 * 
 * @author Joe Adams
 **/
var master = require('./master.js');
var Chessboard = require("./chessboard.js");
var utils = require("./utils.js");
var Vector = require("./vector.js");
var _ = require("underscore");
var pieces = require("./pieces.js");

module.exports = {
    create : create,
    getTurn : getTurn,
    setSide : setSide,
    getBoard : getBoard,
    getMoves : getMoves,
    getState : getState,
    printBoard : printBoard,
    getPiece : getPiece,
    move : move,
    getConfigs : getConfigs,
    toJSONObj : toJSONObj,
    toClientJSONObj : toClientJSONObj,
    loadJSONObj : loadJSONObj,
    getAllPieces : getAllPieces,
    getMaxTeamValue : getMaxTeamValue,
    getTeam : getTeam,
    states : states
};

/**
 * Creates the match
 * @param  {Object} lightSide the lightside piece information
 * @param  {Object} darkSide  the darkside piece information
 * @return {Object} match     the match object
 */
function create(cb, lightSide, darkSide){
   return {
        turn : master.getConfigs().lightTeam,
        board :  Chessboard.create(lightSide, darkSide),
        history : [],
        state : states.normal
    };
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
 * Gets the state of the match
 * @param  {Object} match The match to get the state of
 * @return {String}       The state
 */
function getState (match) {
    return match.state;
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

function setSide(match, isLightSide, side){
    return Chessboard.setSide(isLightSide, side, getBoard(match));
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
function getMoves(match, vec, filter, returnArray){
    // If there is no filter passed in, filter moves by legality
    filter = utils.existy(filter) ? filter : legalMovesFilter;  

    var moves = _.filter(
            // Get all possible moves from piece
            Chessboard.getMoves(getBoard(match), Chessboard.getSpace(getBoard(match), vec)),
            filter(match)
        );

    if(returnArray)
        return moves;
    else
        return _.map(moves, function(move) {
            return move.toClientJSONObj();
        });
    
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
 * @return {Object}       A response object 
 */
function move(match, loc1, loc2, team){
    var Rules = require("./rules.js");

    var board = getBoard(match);

    var success;
    var data;

    // If the turn of the match isnt equal to the team of the person trying to move
    if(getTurn(match) != team)
        return {
            success : false,
            data : 'It is not your turn.'
        };

    else if(utils.existy(Chessboard.getPiece(getBoard(match), loc1))){
        // Filter out the illgal moves, then find the move to the right location
        var m = _.find(
                        // Get all the moves that can be made for the piece
                        getMoves(match, loc1, canMoveFilter, true),
                        // Find the move that has the right end location
                        function(move){
                            return Vector.isEqual(loc2, move.getEndLoc());
                        }
                    );
        // If a move exists, then make the move
        if(utils.existy(m) && m.getTeam() === team){
            m.perform(board);
            switchTurn(match);
            // Adds move to history
            addMove(match, m);
            // Updates match state
            Rules.updateState(match);
            success = true;

            data = match;
        }

        else{
            success = false;
            data = 'That is not a valid move.';
        }
    }
    else{
        success = false;
        data = 'There is no piece to move.';
    }
    return makeResponse(success, data);
}

function getTeam (isLightSide) {
    var team = getConfigs().lightTeam;
    if(!isLightSide)
        team = getConfigs().darkTeam;
    return team;
}

/**
 * Switches the turn
 * @param  {Object} match The match 
 */
function switchTurn(match){
    if(getTurn(match) === getConfigs().lightTeam)
        setTurn(match, getConfigs().darkTeam);
    else
        setTurn(match, getConfigs().lightTeam);
}

/**
 * Gets the configs for the match
 * @param  {Object} match The match
 * @return {Object}       The configurations
 */
function getConfigs(){
    return master.getConfigs();
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
function toJSONObj(match){
    var JSONObj = {
        version : getConfigs().version,

        turn : getTurn(match),

        board : Chessboard.toJSONObj(getBoard(match)),

        history : _.map(getHistory(match), function(move) {
            return move.toJSONObj();
        }),

        state : getState(match)
    };
    return JSONObj;
}

/**
 * Returns the match object as a JSON String.
 * The string contains only the information needed to render the match on the client.
 * The match cannot be loaded from this JSON String (For that, see toJSON).
 * @param  {Object} match
 * @return {JSON}
 */
function toClientJSONObj(match){
    var JSONObj = {
        isLightTurn : getTurn(match) == getConfigs().lightTeam,

        board : Chessboard.toClientJSONObj(getBoard(match)),

        history : _.map(getHistory(match), function(move) {
            return move.toClientJSONObj();
        }),

        state : getState(match)
    }

    return JSONObj;
}

/**
 * Loads the match from the JSON
 * @param  {JSON} json
 * @return {Object} The Match Object
 */
function loadJSONObj(JSONObj){

    var configs = getConfigs();
    var match = {
        turn : JSONObj.turn,

        board : Chessboard.loadJSONObj(JSONObj.board),

        history : _.map(JSONObj.history, function(m) {
            var move = master.getMove(m.type);
            move = new move(m);
            if(m.capturedPiece){
                move.capturedPiece = pieces.loadPiece(m.capturedPiece);
            }
            return move;
        }),

        state : JSONObj.state
    };

     
    return match;
}

/**
 * Creates a response object
 * @param  {Boolean} success Whether the request was successful or not
 * @param  {Object} data     The data for the response
 * @return {Object}          The response object
 */
function makeResponse (success, data) {
    return {
        success : success,
        data :data
    };
}

function getAllPieces(){
    var configs = master.getPieceConfigs();
    return _.map(configs, function(piece) {
        var obj = _.clone(piece);
        delete obj.schemas;
        return obj;
    });
}

function getMaxTeamValue () {
    return master.getConfigs().maxTeamValue;
}

var states = {
    normal : "normal",
    check : "check",
    checkmate : "checkmate",
    stalemate : "stalemate"
}
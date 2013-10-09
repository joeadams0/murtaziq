/**
 * 
 * rules.js
 * Defines the rules for a chess match
 * 
 * @author Joe Adams
 **/
 var Match;
var Chessboard;
var _ = require("underscore");

module.exports = {
    canMove : canMove,
    isLegalMove : isLegalMove
};

/**
 * Checks if the move can be performed in the current match state. 
 * @param  {Object} match The match state
 * @param  {Object} move  The move to check
 * @return {Boolean}       If it is the correct turn and the move is legal.
 */
function canMove(match, move){
    setRequires();
    return Match.getTurn(match) === move.getTeam() && isLegalMove(Match.getBoard(match), move);
}

/**
 * Checks if the move is legal for a given board.
 * @param  {Object}  board [description]
 * @param  {Object}  move  [description]
 * @return {Boolean}       [description]
 */
function isLegalMove(board, move){
    setRequires();
    
    move.perform(board);
    var legal = _.size(Chessboard.getThreateningPieces(board, Chessboard.getRoyalSpace(board, move.getTeam()))) === 0;
    move.undo(board);
    return legal;
}

function setRequires(){
    Chessboard = require("./chessboard.js");
    Match = require("./match.js");
}
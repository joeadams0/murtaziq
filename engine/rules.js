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
    isLegalMove : isLegalMove,
    updateState : updateState
};

/**
 * Checks if the move can be performed in the current match state. 
 * The difference between this and isLegalMove is that canMove takes the player's turn into account, while isLegalMove doesn't
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
 * @param  {Object}  board The board to check the legality on
 * @param  {Object}  move  The move to check
 * @return {Boolean}       If the move is legal on the board
 */
function isLegalMove(board, move){
    setRequires();
    
    // Simulate the move
    move.perform(board);
    // If the array of moves that threaten the royal piece has no elements, then it is legal
    var legal = _.size(Chessboard.getThreateningPieces(
            board, 
            // Get royal piece
            Chessboard.getRoyalSpace(board, move.getTeam()))
    ) === 0;
    // Undo the simulation
    move.undo(board);
    return legal;
}

/**
 * Set the requires for the rules.js file
 */
function setRequires(){
    Chessboard = require("./chessboard.js");
    Match = require("./match.js");
}


/**
 * TODO Justin
 * Updates the state of the match. For all possible states, see "states" variable in match.js
 * @param  {Object} match The match
 * Note: called right after every move
 *
 * 3 Possibilities:
 * Check: True if any piece of the player who just moved is able to attack the royal of the player who's turn it is currently AND the player who's turn it is has a legal move to make
 * Checkmate: Same as above except the player does not have a legal move to make
 * Stalemate: True if the player does not have a legal move and no piece is able to attack his royal
 */
function updateState (match) {
    
}
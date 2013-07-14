var Move;
var Match;
var Chessboard;
var _ = require("underscore");

module.exports = {
    canMove : canMove,
    isLegalMove : isLegalMove
};

function canMove(match, move){
    setRequires();
    return Match.getTurn(match) === Move.getTeam(move) && isLegalMove(Match.getBoard(match), move);
}

function isLegalMove(board, move){
    setRequires();
    
    Move.perform(board,move);
    var legal = _.size(Chessboard.getThreateningPieces(board, Chessboard.getRoyalSpace(board, Move.getTeam(move)))) === 0;
    Move.undo(board, move);
    
    return legal;
}

function setRequires(){
    Move = require("./moves/move.js");
    Chessboard = require("./chessboard.js");
    Match = require("./match.js");
}
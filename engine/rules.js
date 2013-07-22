var Match;
var Chessboard;
var _ = require("underscore");

module.exports = {
    canMove : canMove,
    isLegalMove : isLegalMove
};

function canMove(match, move){
    setRequires();
    return Match.getTurn(match) === move.getTeam() && isLegalMove(Match.getBoard(match), move);
}

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
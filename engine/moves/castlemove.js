var Move = require("./move.js");
var Chessboard = require("../chessboard.js");
var Vector = require("../vector.js");

module.exports = function(move){
    this.__proto__ = new Move(move.getTeam(), move.getLoc(), move.getVec(), move.getStep()+1, move.getCapturedPiece(), "castle");
    this.perform = perform;
    this.undo = undo;
    this.getRoyalEndLoc = getRoyalEndLoc;
    this.getCastleEndLoc = getCastleEndLoc;
};


function perform(board){
    Chessboard.getPiece(board,this.getEndLoc()).incrMoveCount();
    Chessboard.getPiece(board,this.getLoc()).incrMoveCount();
    return Chessboard.setPiece(
        Chessboard.setPiece(
            board, 
            this.getRoyalEndLoc(), 
            Chessboard.removePiece(board, this.getEndLoc())
        ),
        this.getCastleEndLoc(),
        Chessboard.removePiece(board, this.getLoc())
    );
}

function undo(board){
    Chessboard.getPiece(board,this.getRoyalEndLoc()).incrMoveCount();
    Chessboard.getPiece(board,this.getCastleEndLoc()).incrMoveCount();
    return Chessboard.setPiece(
        Chessboard.setPiece(
            board, 
            this.getLoc(), 
            Chessboard.removePiece(board, this.getCastleEndLoc())
        ),
        this.getEndLoc(),
        Chessboard.removePiece(board, this.getRoyalEndLoc())
    );
}

function getRoyalEndLoc(){
    return Vector.add(this.getLoc(), Vector.scale(this.getVec(), this.getStep()-2));
}

function getCastleEndLoc(){
    return Vector.add(this.getLoc(), Vector.scale(this.getVec(), this.getStep()-1));
}
var master = require('../master.js');
var Move = master.getMove('normal');
var Chessboard = require("../chessboard.js");
var Vector = require("../vector.js");

module.exports = function(params){
    params.step = params.step + 1;
    params.type = 'castle';
    
    this.__proto__ = new Move(params);
    this.perform = perform;
    this.undo = undo;
    this.getRoyalEndLoc = getRoyalEndLoc;
    this.getCastleEndLoc = getCastleEndLoc;
    this.toClientJSONObj = toClientJSONObj;
    this.getRoyalLoc = getRoyalLoc;
    this.getRoyalEndLoc = getRoyalEndLoc;

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

function getRoyalLoc(){
    return Vector.add(this.getLoc(), Vector.scale(this.getVec(), this.getStep()+1));
}

function getCastleEndLoc(){
    return Vector.add(this.getLoc(), Vector.scale(this.getVec(), this.getStep()-1));
}

function toClientJSONObj () {
    var JSONObj = {
        type : this.getType(),
        moves : [
        {
            source : this.getLoc(),
            target : this.getCastleEndLoc(),
            team : this.getTeam(),
        },

        {
            source : this.getRoyalLoc(),
            target : this.getRoyalEndLoc(),
            team : this.getTeam(),
        }]
    };

    return JSONObj;
}
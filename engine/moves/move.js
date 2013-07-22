
var Vector;
var Chessboard;
var utils;

module.exports = function(team, loc, vec, step, capturedPiece, type){
    setRequires();
    
    this.team = team;
    this.loc = loc;
    this.vec = vec;
    this.step = step;
    this.capturedPiece = capturedPiece;
    this.type = utils.existy(type) ? type : "normal";
    
    this.getLoc = getLoc;
    this.getVec = getVec;
    this.getStep = getStep;
    this.perform = perform;
    this.undo = undo;
    this.getEndLoc = getEndLoc;
    this.getTeam = getTeam;
    this.getCapturedPiece = getCapturedPiece;
};

function getLoc(){
    return this.loc;
}

function getVec(){
    return this.vec;
}

function getStep(){
    return this.step;
}

function getTeam() {
    return this.team;
}

function getCapturedPiece(){
    return this.capturedPiece;
}

function perform(board){
    setRequires();
    Chessboard.getPiece(board, this.getLoc()).incrMoveCount();
    return Chessboard.setPiece(board, this.getEndLoc(), Chessboard.removePiece(board, this.getLoc())); 
}

function undo(board){
    setRequires();
    
    Chessboard.getPiece(board, this.getEndLoc()).decrMoveCount();
    Chessboard.setPiece(board, this.getLoc(), Chessboard.removePiece(board, this.getEndLoc())); 
    if(utils.existy(this.getCapturedPiece()))
        Chessboard.setPiece(board, this.getEndLoc(), this.getCapturedPiece());
    return board;
}

function getEndLoc(){
    setRequires();
    return Vector.add(this.getLoc(), Vector.scale(this.getVec(), this.getStep()));
}

function setRequires(){
    Vector = require("../vector.js");
    Chessboard = require("../chessboard.js");
    utils = require("../utils.js");
}
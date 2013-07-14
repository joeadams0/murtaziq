
var Vector;
var Chessboard;
var Piece;
var utils;

module.exports = {
    create : create,
    getLoc : getLoc,
    getStep : getStep,
    perform : perform,
    undo : undo,
    getEndLoc : getEndLoc,
    getTeam : getTeam
};

function create(team, loc, step, capturedPiece){
    return {
        team : team,
        loc : loc,
        step : step,
        capturedPiece : capturedPiece
    };
}

function getLoc(move){
    return move.loc;
}

function getStep(move){
    return move.step;
}

function getTeam(move) {
    return move.team;
}

function getCapturedPiece(move){
    return move.capturedPiece;
}

function perform(board, move){
    setRequires();
    
    Piece.incrMoveCount(Chessboard.getPiece(board, getLoc(move)));
    return Chessboard.setPiece(board, getEndLoc(move), Chessboard.removePiece(board, getLoc(move))); 
}

function undo(board, move){
    setRequires();
    
    Piece.decrMoveCount(Chessboard.getPiece(board, getEndLoc(move)));
    var piece = Chessboard.setPiece(board, getLoc(move), Chessboard.removePiece(board, getEndLoc(move))); 
    if(utils.existy(getCapturedPiece(move)))
        Chessboard.setPiece(board, getEndLoc(move), getCapturedPiece(move));
    return piece;
}

function getEndLoc(move){
    setRequires();
    return Vector.add(getLoc(move), getStep(move));
}

function setRequires(){
    Vector = require("../vector.js");
    Chessboard = require("../chessboard.js");
    Piece = require("../pieces/piece.js");
    utils = require("../utils.js");
}
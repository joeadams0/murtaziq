var Piece = require("./pieces/piece.js");
var Chessboard = require("./chessboard.js");
var _ = require("underscore");

module.exports = {
    create : create,
    getTurn : getTurn,
    getBoard : getBoard,
    getMoves : getMoves,
    printBoard : printBoard,
    getPiece : getPiece
};

function create(lightSide, darkSide){
    return {
      turn : Piece.lightSide,
      board : Chessboard.create(lightSide, darkSide)
    };
}

function getTurn(match){
    return match.turn;
}

function getBoard(match){
    return match.board;
}

function getMoves(match, vec){
    return Piece.getMoves(getBoard(match), Chessboard.getSpace(getBoard(match), vec));
}

function printBoard(match){
    var args = arguments;
    args[0] = getBoard(match);
    Chessboard.print.apply(Chessboard, args);
}

function move(match, loc1, loc2){
}

function getPiece(match, loc1){
    return Chessboard.getPiece(getBoard(match), loc1);
}
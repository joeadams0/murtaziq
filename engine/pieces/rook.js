var Piece = require("./piece.js");
var config = require("./configs/rookconfig.js");
var _ = require("underscore");
var Space = require("../space.js");
var Chessboard = require("../chessboard.js");
var utils = require("../utils.js");
var Vector = require("../vector.js");
var CastleMove = require("../moves/castlemove.js");

module.exports = function (configs, team){
    this.__proto__ = new Piece(configs, config.name, config.abbr, team, config.schema);
    this.getMoves = getMoves;
};


function getMoves(board, space){
    var moves = this.__proto__.getMoves(board,space);
    var royalSpace = Chessboard.getRoyalSpace(board, this.getTeam(Space.getPiece(space)));
    if(this.getMoveCount(Space.getPiece(space)) === 0 && this.getMoveCount(Space.getPiece(space)) === 0){
        var move = _.find(moves, adjacentMoveFilter(board, royalSpace));
        
        if(utils.existy(move)){
            moves.push(new CastleMove(move));
        }
    }
    return moves;
}

function adjacentMoveFilter(board, targetSpace){
    return function(move){
        return  Vector.isEqual(
                    Space.getLoc(Chessboard.getSpace(board, Vector.subtract(Space.getLoc(targetSpace), Vector.create(1,0)))), 
                    move.getEndLoc()
                ) ||
                Vector.isEqual(
                    Space.getLoc(Chessboard.getSpace(board, Vector.add(Space.getLoc(targetSpace), Vector.create(1,0)))), 
                    move.getEndLoc()
                );
    }  ; 
}
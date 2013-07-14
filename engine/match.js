var Piece = require("./pieces/piece.js");
var Chessboard = require("./chessboard.js");
var _ = require("underscore");
var utils = require("./utils.js");
var Vector = require("./vector.js");
var Move = require("./moves/move.js");

module.exports = {
    create : create,
    getTurn : getTurn,
    getBoard : getBoard,
    getMoves : getMoves,
    printBoard : printBoard,
    getPiece : getPiece,
    move : move
};

function create(lightSide, darkSide){
    return {
      turn : Piece.lightTeam,
      board : Chessboard.create(lightSide, darkSide),
      history : []
    };
}

function getTurn(match){
    return match.turn;
}

function getHistory(match){
    return match.history;
}

function addMove(match, move){
    getHistory(match).push(move);
}

function removeMove(match){
    return getHistory(match.pop());
}
function setTurn(match, turn){
    match.turn = turn;
}

function getBoard(match){
    return match.board;
}

function getMoves(match, vec, filter){
    filter = utils.existy(filter) ? filter : legalMovesFilter;  
    return _.filter(
            Piece.getMoves(getBoard(match), Chessboard.getSpace(getBoard(match), vec)),
            filter(match)
        );
}

function printBoard(match){
    var args = arguments;
    args[0] = getBoard(match);
    Chessboard.print.apply(Chessboard, args);
}

function getPiece(match, loc1){
    return Chessboard.getPiece(getBoard(match), loc1);
}

function move(match, loc1, loc2){
    var board = getBoard(match);
    if(utils.existy(Chessboard.getPiece(getBoard(match), loc1))){
        // Filter out the illgal moves, then find the move to the right location
        var m = _.find(
                        getMoves(match, loc1, canMoveFilter),
                        function(move){
                            return Vector.isEqual(loc2, Move.getEndLoc(move));
                        }
                    );
        if(utils.existy(m)){
            Move.perform(board, m);
            switchTurn(match);
            addMove(match, m);
        }
    }
    return match;
}

function switchTurn(match){
    if(getTurn(match) === Piece.lightTeam)
        setTurn(match, Piece.darkTeam);
    else
        setTurn(match, Piece.lightTeam);
}

function canMoveFilter(match){
    var Rules = require("./rules.js");
    return function (move){
        return Rules.canMove(match, move);
    };
}

function legalMovesFilter(match){
    var Rules = require("./rules.js");
    return function(move){
        return Rules.isLegalMove(getBoard(match), move);
    };
}
/**
 * 
 * abstractpiece.js
 * Collects functionality for piece
 * 
 * @author Joe Adams
 **/
var utils = require("../utils.js");
var _ = require("underscore");
var vector = require("../vector.js");
var moveschema = require("./configs/moveschema.js");
var rules = require("../rules.js");
var Space = require("../space.js");
var move = require("../moves/simplemove.js");

var lightTeam = 0;
var darkTeam = 1;

module.exports ={
    lightTeam : lightTeam,
    darkTeam : darkTeam,
    create : create,
    getName : getName,
    getAbbr : getAbbr,
    getTeam : getTeam,
    getSchema : getSchema,
    getMoves : getMoves,
    getMoveCount : getMoveCount,
    incrMoveCount : incrMoveCount,
    decrMoveCount : decrMoveCount,
    canMove : canMove
};

function create(name, abbr, team, schema){
    if(team === lightTeam)
        return {
            name : name,
            abbr : abbr,
            team : team,
            moveCount : 0,
            schema : schema
        };
    else{
        var obj = {
            name : name,
            abbr : abbr,
            team : team,
            moveCount : 0,
            schema : moveschema.reflectSchema(schema)
        };
        
        return obj;
    }
}

function getName(piece){
    return piece.name;
}

function getAbbr(piece){
    return piece.abbr;
}

function getTeam(piece) {
    return piece.team;
}

function getSchema(piece){
    return piece.schema;
}

function getMoveCount(piece){c
    return piece.moveCount;
}

function incrMoveCount(piece){
    setMoveCount(piece, getMoveCount(piece) + 1);
}

function decrMoveCount(piece){
    setMoveCount(piece, getMoveCount(piece) - 1);
}

function setMoveCount(piece, num){
    piece.moveCount = num;
}

function getMoves(board, space){
    if(utils.existy(Space.getPiece(space)))
        return leaperMoves(board, Space.getLoc(space), getSchema(Space.getPiece(space)), Space.getPiece(space));
    else 
        return [];
}

function leaperMoves(board, loc, schema, piece){
    if(_.isArray(schema))
            return schemaIterate(board, loc, piece);
    else
        return schemaEval(
            board, 
            loc, 
            schema,
            piece
        );
}

function schemaIterate(board, loc, piece){
    return _.reduce(
        getSchema(piece), 
        function(memo, singleSchema){
            _.each(leaperMoves(board, loc, singleSchema, piece), function(el){
               memo.push(el); 
            });
            return memo;
        }, 
        []);
}

function schemaEval(board, loc, schema, piece, moves, step){
    step = utils.existy(step) ? step : 0;
    moves = utils.existy(moves) ? moves : [];
    // Cant move any more
    if(step >= schema.maxSteps || 
        !canMove(
            board,
            loc,
            vector.add(loc, vector.scale(moveschema.getVector(schema), step+1)),
            schema,
            piece
        )
    )
        return moves;
    // Can move
    else
        return schemaEval(
            board, 
            loc, 
            schema,
            piece,
            utils.arrPush(moves, move.create(loc, moveschema.getVector(schema))),
            step + 1
        );
}


// TODO : check to see if they put the king in check
function canMove(board, source, target, schema, piece){
    var chessboard = require("../chessboard.js");
    var canSimpleMove = moveschema.canMove(schema);
    var canAttack = moveschema.canAttack(schema);
    
    // Cant move
    if(!utils.existy(chessboard.getSpace(board, target)) || 
        !rules.canMove(board, source, target, canAttack) || 
        (
            utils.existy(moveschema.getCondition(piece)) && 
            moveschema.getCondition(piece)(board, source, piece) 
        )
    )
        return false;
    
    // If the target is empty
    if(!utils.existy(Space.getPiece(chessboard.getSpace(board, target))))
        return canSimpleMove;
        
    // If they are not on the same team
    return getTeam(Space.getPiece(chessboard.getSpace(board, source))) != getTeam(Space.getPiece(chessboard.getSpace(board, target))) &&
        canAttack &&
        rules.canMove(board, source, target);
}
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
var Space = require("../space.js");
var Move = require("../moves/move.js");

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
    isRoyal : isRoyal,
    getMoves : getMoves,
    getMoveCount : getMoveCount,
    incrMoveCount : incrMoveCount,
    decrMoveCount : decrMoveCount,
    canMove : canMove
};

function create(name, abbr, team, schema, isRoyal){
    if(team === lightTeam)
        return {
            name : name,
            abbr : abbr,
            team : team,
            moveCount : 0,
            schema : schema,
            isRoyal : utils.existy(isRoyal) ? isRoyal : false
        };
    else
         return {
            name : name,
            abbr : abbr,
            team : team,
            moveCount : 0,
            schema : moveschema.reflectSchema(schema),
            isRoyal : utils.existy(isRoyal) ? isRoyal : false
        };
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

function getMoveCount(piece){
    return piece.moveCount;
}

function isRoyal(piece){
    return piece.isRoyal;
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
    var Chessboard = require("../chessboard.js");
    step = utils.existy(step) ? step : 0;
    moves = utils.existy(moves) ? moves : [];
    // Cant move any more
    if(step >= moveschema.getMaxSteps(schema) ||  
        !Chessboard.isOnBoard(board, vector.add(loc, vector.scale(moveschema.getVector(schema), step+1))) ||
        !canMove(
            board,
            loc,
            vector.add(loc, vector.scale(moveschema.getVector(schema), step+1)),
            schema,
            piece,
            vector.add(loc, vector.scale(moveschema.getVector(schema), step))
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
            utils.arrPush(moves, Move.create(
                                        getTeam(piece), 
                                        loc, 
                                        vector.scale(moveschema.getVector(schema), step+1),
                                        Chessboard.getPiece(board, vector.add(loc, vector.scale(moveschema.getVector(schema), step+1)))
                                    )
                        ),
            step + 1
        );
}


function canMove(board, source, target, schema, piece, previousStep){
    var chessboard = require("../chessboard.js");
    var canSimpleMove = moveschema.canMove(schema);
    var canAttack = moveschema.canAttack(schema);
    
    // Cant move, make sure the previous step did not contain a piece on the enemy team
    if(!utils.existy(chessboard.getSpace(board, target)) ||
        (
            utils.existy(moveschema.getCondition(schema)) && 
            !moveschema.getCondition(schema)(board, source, piece) 
        ) ||
        ( 
            utils.existy(chessboard.getPiece(board, previousStep)) &&
            getTeam(chessboard.getPiece(board,previousStep)) != getTeam(chessboard.getPiece(board, source))
        )
    )
        return false;
    
    // If the target is empty
    if(!utils.existy(Space.getPiece(chessboard.getSpace(board, target))))
        return canSimpleMove;
        
    
    // If they are not on the same team
    return getTeam(Space.getPiece(chessboard.getSpace(board, source))) != getTeam(Space.getPiece(chessboard.getSpace(board, target))) &&
        canAttack ;
}
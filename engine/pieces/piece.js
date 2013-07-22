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

var lightTeam;
var darkTeam;

module.exports = function(configs, name, abbr, team, schema, royalty){
    lightTeam = configs.lightTeam;
    darkTeam = configs.darkTeam;
    
    this.name = name;
    this.abbr = abbr;
    this.team = team;
    this.moveCount = 0;
    this.schema = team == lightTeam ? schema : moveschema.reflect(schema);
    this.royalty = utils.existy(royalty) ? royalty : false;
    this.lightTeam = lightTeam;
    this.darkTeam = darkTeam;
    
    this.getName = getName;
    this.getAbbr = getAbbr;
    this.getTeam = getTeam;
    this.getSchema = getSchema;
    this.isRoyal = isRoyal;
    this.getMoves = getMoves;
    this.getMoveCount = getMoveCount;
    this.incrMoveCount = incrMoveCount;
    this.decrMoveCount = decrMoveCount;
    this.setMoveCount = setMoveCount;
    this.canMove = canMove;
};

function getName(){
    return this.name;
}

function getAbbr(){
    return this.abbr;
}

function getTeam() {
    return this.team;
}

function getSchema(){
    return this.schema;
}

function getMoveCount(){
    return this.moveCount;
}

function isRoyal(){
    return this.royalty;
}

function incrMoveCount(){
    this.setMoveCount(this.getMoveCount() + 1);
}

function decrMoveCount(){
    this.setMoveCount(this.getMoveCount() - 1);
}

function setMoveCount(num){
    this.moveCount = num;
}

function getMoves(board, space){
    return leaperMoves.bind(this)(board, Space.getLoc(space), this.getSchema((Space.getPiece(space))));
}

function leaperMoves(board, loc, schema){
    if(_.isArray(schema))
            return schemaIterate.bind(this)(board, loc);
    else
        return schemaEval.bind(this)(
            board, 
            loc, 
            schema
        );
}

function schemaIterate(board, loc){
    var self = this;
    return _.reduce(
        this.getSchema(), 
        function(memo, singleSchema){
            _.each(leaperMoves.bind(self)(board, loc, singleSchema), function(el){
               memo.push(el); 
            });
            return memo;
        }, 
        []);
}

function schemaEval(board, loc, schema, moves, step){
    var Chessboard = require("../chessboard.js");
    step = utils.existy(step) ? step : 0;
    moves = utils.existy(moves) ? moves : [];
    // Cant move any more
    if(step >= moveschema.getMaxSteps(schema) ||  
        !Chessboard.isOnBoard(board, vector.add(loc, vector.scale(moveschema.getVector(schema), step+1))) ||
        !canMove.bind(this)(
            board,
            loc,
            vector.add(loc, vector.scale(moveschema.getVector(schema), step+1)),
            schema,
            vector.add(loc, vector.scale(moveschema.getVector(schema), step))
        )
    )
        return moves;
    // Can move
    else
        return schemaEval.bind(this)(
            board, 
            loc, 
            schema,
            utils.arrPush(moves, new Move(
                                        this.getTeam(), 
                                        loc, 
                                        moveschema.getVector(schema),
                                        step+1,
                                        Chessboard.getPiece(board, vector.add(loc, vector.scale(moveschema.getVector(schema), step+1)))
                                    )
                        ),
            step + 1
        );
}


function canMove(board, source, target, schema, previousStep){
    var chessboard = require("../chessboard.js");
    var canSimpleMove = moveschema.canMove(schema);
    var canAttack = moveschema.canAttack(schema);
    
    // Cant move, make sure the previous step did not contain a piece on the enemy team
    if(!utils.existy(chessboard.getSpace(board, target)) ||
        (
            utils.existy(moveschema.getCondition(schema)) && 
            !moveschema.getCondition(schema)(board, source, this) 
        ) ||
        ( 
            utils.existy(previousStep) &&
            utils.existy(chessboard.getPiece(board, previousStep)) &&
            chessboard.getPiece(board,previousStep).getTeam() != this.getTeam()
        )
    )
        return false;
    
    // If the target is empty
    if(!utils.existy(Space.getPiece(chessboard.getSpace(board, target))))
        return canSimpleMove;
        
    
    // If they are not on the same team
    return this.getTeam() != Space.getPiece(chessboard.getSpace(board, target)).getTeam() &&
        canAttack ;
}
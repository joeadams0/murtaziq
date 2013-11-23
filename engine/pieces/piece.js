/**
 * 
 * abstractpiece.js
 * Collects functionality for piece
 * 
 * @author Joe Adams
 **/
var master;
var utils = require("../utils.js");
var _ = require("underscore");
var vector = require("../vector.js");
var Space = require("../space.js");
var moveschema;


var lightTeam;
var darkTeam;

// Returns a function that makes a piece
module.exports = {
    init : function(pieceConfigs){
        return constructorGenerator(pieceConfigs);
    },
    loadJSONObj : loadJSONObj
};

/**
 * Creates a function that can create a specified piece 
 * @param  {Object} pieceConfigs The piece to create
 * @return {Function}            The piece generator
 */
function constructorGenerator(pieceConfigs){
    
    return function(team, position, royalty){
        master = require('../master.js');

        var configs = master.getConfigs();

        moveschema = master.getSchema("moveschema.js");

        lightTeam = configs.lightTeam;
        darkTeam = configs.darkTeam;


        this.name = pieceConfigs.name;
        this.value = pieceConfigs.value;
        this.abbr = pieceConfigs.abbr;
        this.schemaDir = configs.schemaDir;
        this.position = position;
        this.team = team;
        this.moveCount = 0;
        this.royalty = utils.existy(royalty) ? royalty : false;
        this.lightTeam = lightTeam;
        this.darkTeam = darkTeam;
		this.getPosition=getPosition;
        this.getName = getName;
        this.getAbbr = getAbbr;
        this.getTeam = getTeam;
        this.getValue = getValue;
        this.getSchemas = getSchemas;
        this.isRoyal = isRoyal;
        this.getMoves = getMoves;
        this.getMoveCount = getMoveCount;
        this.incrMoveCount = incrMoveCount;
        this.decrMoveCount = decrMoveCount;
        this.setMoveCount = setMoveCount;
        this.canMove = canMove;
        this.setSchemas = setSchemas;
        this.getSchemaFiles = getSchemaFiles;
        this.toJSONObj = toJSONObj;
        this.toClientJSONObj = toClientJSONObj;

        this.setSchemas(pieceConfigs.schemas);
		this.getCastleMove = getCastleMove;
    }

}

function getName(){
    return this.name;
}

function getAbbr(){
    return this.abbr;
}

function getTeam() {
    return this.team;
}

function getValue() {
    return this.value;
}

function getPosition(){
	return this.position;
}

function getSchemas(){
    return this.schemas;
}

function setSchemas(arr){
    this.schemaFiles = arr;

    var self = this;
    this.schemas = _.reduce(arr, function(memo, file) {
        var schema = master.getSchema(file);

        if(self.getTeam() == self.darkTeam)
            schema = moveschema.reflect(schema);

        return _.union(memo, schema);
    },[]);
}

function getSchemaFiles () {
    return this.schemaFiles;
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
//
function getMoves(board, space){
	//if (getPosition === "pawn")
	//	return _.union(leaperMoves.bind(this)(board, Space.getLoc(space), this.getSchemas((Space.getPiece(space)))), );
	if (this.getPosition() === "rook"){
		return this.getCastleMove(board, space, leaperMoves.bind(this)(board, Space.getLoc(space), this.getSchemas((Space.getPiece(space)))));
		}
	else
		return leaperMoves.bind(this)(board, Space.getLoc(space), this.getSchemas((Space.getPiece(space))));
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

//pulled from rook.js
function getCastleMove(board, space, moves){
	var Chessboard = require("../chessboard.js");
    var CastleMove = master.getMove('castle');
    var royalSpace = Chessboard.getRoyalSpace(board, this.getTeam(Space.getPiece(space)));
    if(this.getMoveCount(Space.getPiece(space)) === 0 && this.getMoveCount(Space.getPiece(space)) === 0){
        var move = _.find(moves, adjacentMoveFilter(board, royalSpace));
          if(utils.existy(move)){
            moves.push(new CastleMove({
                team : move.getTeam(), 
                loc : move.getLoc(), 
                vec : move.getVec(), 
                step : move.getStep(), 
                capturedPiece : move.getCapturedPiece()
            }));
        }
    }
	
    return moves;
}
//pulled from rook.js
function adjacentMoveFilter(board, targetSpace){
	var Chessboard = require("../chessboard.js");
	return function(move){
		return  vector.isEqual(
                    Space.getLoc(Chessboard.getSpace(board, vector.subtract(Space.getLoc(targetSpace), vector.create(1,0)))), 
                    move.getEndLoc()
                ) ||
                vector.isEqual(
                    Space.getLoc(Chessboard.getSpace(board, vector.add(Space.getLoc(targetSpace), vector.create(1,0)))), 
                    move.getEndLoc()
                );
    }  ; 
}











function schemaIterate(board, loc){
    var self = this;
    return _.reduce(
        this.getSchemas(), 
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
    var Move = master.getMove('normal');
    
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
            utils.arrPush(moves, new Move({
                                        team : this.getTeam(), 
                                        loc : loc, 
                                        vec : moveschema.getVector(schema),
                                        step : step+1,
                                        capturedPiece : Chessboard.getPiece(board, vector.add(loc, vector.scale(moveschema.getVector(schema), step+1)))
                                    })
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


function toJSONObj () {
    return {
        name : this.getName(),
        value : this.getValue(),
        abbr : this.getAbbr(),
        team : this.getTeam(),
        moveCount : this.getMoveCount(),
        royalty : this.isRoyal(),
        schemas : this.schemaFiles,
    }
}

function loadJSONObj(JSONObj, configs){
    var piece = constructorGenerator(JSONObj);
    piece = new piece(JSONObj.team, JSONObj.position, JSONObj.royalty);
    piece.setMoveCount(JSONObj.moveCount);
    return piece;
}

function toClientJSONObj () {
    return {
        name : this.getName(),
        value : this.getValue(),
        abbr : this.getAbbr(),
        team : this.getTeam(),
        moveCount : this.getMoveCount(),
        royalty : this.isRoyal(),
    }
}
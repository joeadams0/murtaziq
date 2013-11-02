
var Vector;
var Chessboard;
var utils;

module.exports = function(params){
    setRequires();
    

    this.team = params.team;
    this.loc = params.loc;
    this.vec = params.vec;
    this.step = params.step;
    this.capturedPiece = params.capturedPiece;
    this.type = utils.existy(params.type) ? params.type : "normal";

    
    this.getLoc = getLoc;
    this.getVec = getVec;
    this.getStep = getStep;
    this.getType = getType;
    this.perform = perform;
    this.undo = undo;
    this.getEndLoc = getEndLoc;
    this.getTeam = getTeam;
    this.getCapturedPiece = getCapturedPiece;
    this.toJSONObj = toJSONObj;
    this.toClientJSONObj = toClientJSONObj;
};

/**
 * Gets the starting location of the move
 * @return {Object} The location
 */
function getLoc(){
    return this.loc;
}

/**
 * Gets the vector that describes this move
 * @return {Object} The Vector
 */
function getVec(){
    return this.vec;
}

/**
 * Gets the number of steps to take with the vector for this move
 * @return {Integer} The number of steps
 */
function getStep(){
    return this.step;
}

/**
 * Gets the team that is making this move
 * @return {Integer} The team that is making this move
 */
function getTeam() {
    return this.team;
}

/**
 * Gets the piece that was captured, if any
 * @return {Object} The piece that was captured
 */
function getCapturedPiece(){
    return this.capturedPiece;
}

/**
 * Gets the type of move
 * @return {String} The type of the move
 */
function getType(){
    return this.type;
}

/**
 * Performs the move
 * @param  {Object} board The board to perform the move on
 * @return {Object}       The new board
 */
function perform(board){
    setRequires();
    Chessboard.getPiece(board, this.getLoc()).incrMoveCount();
    return Chessboard.setPiece(board, this.getEndLoc(), Chessboard.removePiece(board, this.getLoc())); 
}

/**
 * Undos the move
 * @param  {Object} board The board to undo the move on
 * @return {Object}       The new board
 */
function undo(board){
    setRequires();
    
    Chessboard.getPiece(board, this.getEndLoc()).decrMoveCount();
    Chessboard.setPiece(board, this.getLoc(), Chessboard.removePiece(board, this.getEndLoc())); 
    if(utils.existy(this.getCapturedPiece()))
        Chessboard.setPiece(board, this.getEndLoc(), this.getCapturedPiece());
    return board;
}

/**
 * Calculates the end location of the move
 * @return {Object} The end location
 */
function getEndLoc(){
    setRequires();
    return Vector.add(this.getLoc(), Vector.scale(this.getVec(), this.getStep()));
}

function setRequires(){
    Vector = require("../vector.js");
    Chessboard = require("../chessboard.js");
    utils = require("../utils.js");
}

function toJSONObj () {
    var JSONObj = {
        loc : this.getLoc(),
        vec : this.getVec(),
        step : this.getStep(),
        team : this.getTeam(),
        type : this.getType()
    };

    if(this.getCapturedPiece())
        JSONObj.capturedPiece = this.getCapturedPiece().toJSONObj();

    return JSONObj;
}

function toClientJSONObj () {
    var configs = getConfigs();
    
    var JSONObj = {
            type : this.getType(),
            source : this.getLoc(),
            target : this.getEndLoc(),
            isLightTeam : this.getTeam() == configs.lightTeam,
            capturedPiece : utils.existy(this.getCapturedPiece()) ? this.getCapturedPiece().toClientJSONObj() : undefined
        };

    return JSONObj;
}

function getConfigs () {
    return require("../master.js").getConfigs();
}
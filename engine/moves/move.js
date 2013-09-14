
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

function getType(){
    return this.type;
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
    var JSONObj = {
            type : this.getType(),
            source : this.getLoc(),
            target : this.getEndLoc(),
            team : this.getTeam(),
            capturedPiece : utils.existy(this.getCapturedPiece()) ? this.getCapturedPiece().toClientJSONObj() : undefined
        };

    return JSONObj;
}
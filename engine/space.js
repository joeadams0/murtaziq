var Vector = require("./vector.js");
var pieces = require('./pieces.js');

module.exports = {
    create : create,
    getLoc : getLoc,
    getPiece : getPiece,
    setPiece : setPiece,
    removePiece : removePiece,
    isEqual : isEqual,
    toJSONObj : toJSONObj,
    loadJSONObj : loadJSONObj
};

function create(vec){
    return {
        vec : vec
    };
}

function getLoc(space){
    return space.vec;
}

function getPiece(space){
    return space.piece;
}

function setPiece(space, piece){
    space.piece = piece;
    
    return space;
}

function removePiece(space){
    var piece = getPiece(space);
    setPiece(space, undefined);
    return piece;
}

function isEqual(space1, space2){
    return Vector.isEqual(getLoc(space1), getLoc(space2));
}

function toJSONObj (space) {
    var JSONObj = {
        loc : getLoc(space),
    };

    if(getPiece(space))
        JSONObj.piece = getPiece(space).toJSONObj();

    return JSONObj;
}

function loadJSONObj (JSONObj, configs) {
    var space = {
        vec : JSONObj.loc
    }
    if(JSONObj.piece)
        space.piece = pieces.loadPiece(JSONObj.piece, configs);

    return space;
}

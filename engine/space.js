var Vector = require("./vector.js");

module.exports = {
    create : create,
    getLoc : getLoc,
    getPiece : getPiece,
    setPiece : setPiece,
    removePiece : removePiece,
    isEqual : isEqual
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

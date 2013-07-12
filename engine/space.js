var utils = require("./utils.js");

module.exports = {
    create : create,
    getLoc : getLoc,
    getPiece : getPiece,
    setPiece : setPiece
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
    if(utils.existy(space.piece))
        return space.piece;
}

function setPiece(space, piece){
    space.piece = piece;
    return space;
}
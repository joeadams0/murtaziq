
var schema = require("./moveschema.js");
var vector = require("../../vector.js");
module.exports = {
    name : 'pawn',
    abbr : 'p',
    schema : [
        schema.create(vector.create(0, 1), 1, true, false),
        schema.create(vector.create(1,1), 1, false, true),
        schema.create(vector.create(-1,1), 1, false, true),
        schema.create(vector.create(0,2), 1, true, false, 
            function(board, loc, piece){
                if(piece.getMoveCount(piece) === 0)
                    return true;
                else
                    return false;
            }
        )
    ]
};
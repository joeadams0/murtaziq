var schema = require('./moveschema.js');
var vector = require("../vector.js");

module.exports = [
    schema.create(vector.create(0, 1), 1, true, false),
    schema.create(vector.create(1,1), 1, false, true),
    schema.create(vector.create(-1,1), 1, false, true),
    schema.create(vector.create(0,2), 1, true, false, 
        function(board, loc, piece){
            if(piece.getMoveCount() === 0)
                return true;
            else
                return false;
        }
    )
]

var piece = require("./pieces/piece.js");
var vector = require("./vector.js");
var colors = require("colors");
var Move = require("./moves/move.js");
var _ = require("underscore");
var Match = require("./match.js");

var match = Match.create();

module.exports = {
    match : match,
    piece : piece,
    vector : vector,
    getMoves : getMoves,
    move : move
};

Match.printBoard(match);
getMoves(0,1);
move(2,1,2,3);
move(2,6,2,4);
move(3,1,3,3);
move(3,6,3,4);
move(4,1,4,3);
move(4,6,4,4);
move(4,0,0,4);
move(7,6,7,5);
move(0,4,0,3);
getMoves(1,6);

function getMoves(x, y){
    console.log("\nMoves at " + vector.toString(vector.create(x,y)));
    var moves = Match.getMoves(match, vector.create(x, y));
    Match.printBoard(
        match,
        {
            positions : _.map(moves, function(m){
                return vector.add(Move.getLoc(m), Move.getStep(m));
            }),
            color : 'green'
        },
        {
            positions : [
                vector.create(x,y)
            ],
            color : 'yellow'
        }
    );
}

function move(x1, y1, x2, y2){
    console.log("\nMove: " + vector.toString(vector.create(x1,y1)) + " -> " + vector.toString(vector.create(x2,y2)));
   Match.printBoard(Match.move(match, vector.create(x1, y1), vector.create(x2,y2)));
}



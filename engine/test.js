
var chessboard = require("./chessboard.js");
var piece = require("./pieces/piece.js");
var vector = require("./vector.js");
var colors = require("colors");
var move = require("./moves/simplemove.js");
var _ = require("underscore");
var Match = require("./match.js");

var match = Match.create();

module.exports = {
    match : match,
    piece : piece,
    vector : vector,
    getMoves : getMoves
};

Match.printBoard(match);

function getMoves(x, y){
    console.log("\nMoves at " + vector.toString(vector.create(x,y)));
    var moves = Match.getMoves(match, vector.create(x, y));
    Match.printBoard(
        match,
        {
            positions : _.map(moves, function(m){
                return vector.add(move.getLoc(m), move.getStep(m));
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



var config = require("./config.js");
var vector = require("./vector.js");
var colors = require("colors");
var _ = require("underscore");
var Match = require("./match.js");

console.log(config);
console.log("here");
var match = Match.create(config);

module.exports = {
    match : match,
    vector : vector,
    getMoves : getMoves,
    move : move
};

Match.printBoard(match);

move(4,1,4,3);
move(4,6,4,4);
move(3,1,3,3);
move(3,6,3,4);
move(3,0,5,2);
move(3,7,5,5); 
move(2,0,4,2);
move(2,7,4,5); 
move(1,0,0,2);
move(1,7,0,5);
move(7,0,4,0);
move(7,7,4,7);
move(0,0,4,0);
move(0,7,4,7);

function getMoves(x, y){
    console.log("\nMoves at " + vector.toString(vector.create(x,y)));
    var moves = Match.getMoves(match, vector.create(x, y));
    Match.printBoard(
        match,
        {
            positions : _.map(moves, function(m){
                return m.getEndLoc();
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



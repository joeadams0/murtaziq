
var vector = require("./vector.js");
var colors = require("colors");
var _ = require("underscore");
var Match = require("./match.js");
var match;

module.exports = {
    getMatch : getMatch,
    vector : vector,
    getMoves : getMoves,
    move : move
};

    
match = Match.create();

/**  test for castle 
move(4,1,4,3);
move(5,6,5,4);
move(4,3,5,4);
move(6,6,6,4);
move(0,1,0,3);
move(4,6,4,4);
move(1,1,1,2);
move(5,7,4,6);
move(2,1,2,2);
move(6,7,5,5);
//move(7,7,4, 7);
getMoves(7,7);
*/



/** test get movelist for rook
move(4,1,4,3);
move(5,6,5,4);
move(4,3,5,4);
move(6,6,6,4);
move(0,1,0,3);
move(4,6,4,4);
move(3,0,7,4);
move(4,7,4,6);
move(1,1,1,2);
move(7, 6,7,5);
move(2,1,2,2);
getMoves(7,7);
**/

/**move check
move(4,1,4,3);
move(5,6,5,4);
move(4,3,5,4);
move(6,6,6,4);
move(0,1,0,3);
move(4,6,4,4);
move(3,0,7,4);
*/

// 3 move checkmate
move(4,1,4,3);
move(5,6,5,4);
move(4,3,5,4);
move(6,6,6,4);
move(3,0,7,4);




function getMatch () {
    return match;
}

function getMoves(x, y){
    console.log("\nMoves at " + vector.toString(vector.create(x,y)));
    var moves = Match.getMoves(match, vector.create(x, y), undefined, true);
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
    Match.printBoard(Match.move(match, vector.create(x1, y1), vector.create(x2,y2), match.turn).data);
}

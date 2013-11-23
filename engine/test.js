
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

//Test for promotion
/*
move(4,1,4,3);
move(5,6,5,4);
move(4,3,5,4);
move(6,6,6,4);
move(0,1,0,3);
move(4,6,4,4); // 4,4 contains the pawn to be promoted
move(4,0,4,1);
move(0,6,0,5);
move(4,1,4,2);
move(0,5,0,4);
move(4,2,5,2);
move(1,6,1,5);
move(5,2,6,2);
move(4,4,4,3); // 4,3 contains the pawn to be promoted
move(1,1,1,2); //other team pawn 
move(4,3,4,2);// 4,2 contains the pawn to be promoted
move(1,2,1,3);
move(4,2,4,1);// 4,1 contains the pawn to be promoted
move(1,3,1,4);
move(4,1,4,0);//pawn should be promoted
move(2,1,2,2);
getMoves(4,0);//get moves for piece in pawn position
*/
//  test for castle 
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
move(7,7,4, 7);




/* test get movelist for rook when castle is possible
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
*/

/**move check
move(4,1,4,3);
move(5,6,5,4);
move(4,3,5,4);
move(6,6,6,4);
move(0,1,0,3);
move(4,6,4,4);
move(3,0,7,4);
*/

/* 3 move checkmate
move(4,1,4,3);
move(5,6,5,4);
move(4,3,5,4);
move(6,6,6,4);
move(3,0,7,4);
*/



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


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

    
Match.create(function(m) {

    match = m;

    move(3,1,3,3);
    move(3,6,3,4);
    var json = Match.toClientJSON(match);

    console.log('\nJSON:\n' + Match.toClientJSON(match)); 
    move(4,1,4,3);
    move(4,6,4,4);
    move(4,3,3,4);
    move(3,7,7,3);

    var json = Match.toClientJSON(match);

    console.log('\nJSON:\n' + Match.toClientJSON(match)); 

    move(1,1,1,2);
    move(2,7,7,2);
    move(0,1,0,2);
    move(1,7,0,5);
    move(2,1,2,2);
    move(0,7,4,7);
});



function getMatch () {
    return match;
}

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

var Match = require("../../engine/match.js");

function main(){
    Match.printBoard(Match.create());
    console.log(JSON.stringify(Match.create()));    
}

main();
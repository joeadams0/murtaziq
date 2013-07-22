module.exports = {
    defaultSide : {
        pawn : 'pawn',
        rook : 'rook',
        knight : 'knight',
        bishop : 'bishop',
        queen : 'queen',
        royal : 'king'
    },
    pieces : {
        pawn : require("./pieces/pawn.js"),
        rook : require("./pieces/rook.js"),
        knight : require("./pieces/knight.js"),
        bishop : require("./pieces/bishop.js"),
        queen : require("./pieces/queen.js"),
        king : require("./pieces/king.js")
    },
    lightTeam : 0,
    darkTeam : 1
};
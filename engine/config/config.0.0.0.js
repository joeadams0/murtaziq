module.exports = {
    version : '0.0.0',
    defaultSide : {
        pawn : 'pawn',
        rook : 'rook',
        knight : 'knight',
        bishop : 'bishop',
        queen : 'queen',
        royal : 'king'
    },
    lightTeam : 0,
    darkTeam : 1,
    moves : {
        'normal' : 'move.js',
        'castle' : 'castle.js'
    }
};

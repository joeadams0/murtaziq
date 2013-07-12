/**
 * 
 * chessboard.js
 * A basic chessboard
 * 
 * @author Joe Adams
 **/
var utils = require("./utils.js");
var _ = require("underscore");
var configs = require("./config.js");
var pieces = require("./pieces.js");
var vector = require("./vector.js");
var Piece = require("./pieces/piece.js");
var Space = require("./space.js");

module.exports = {
    create : create,
    
    getDefaultSide : getDefaultSide,
    
    print : print,
    
    getSpace : getSpace,
    
    getSize : getSize
};


function create(){
    var lightSide = arguments[0] ? arguments[0] : this.getDefaultSide();
    var darkSide = arguments[1] ? arguments[1] : this.getDefaultSide();
    return setLightSide(lightSide, setDarkSide(darkSide, newBoard()));
}

function getSpace(board, vec){
    if(vector.isBounded(vec, vector.create(0,0), getSize(board)))
        return board[vector.getY(vec)][vector.getX(vec)];
}

function getSize(board){
    if(utils.existy(board[0]))
        return vector.create(_.size(board[0]), _.size(board));
    else
        return vector.create(0, _.size(board));
}

function getDefaultSide(){
    return {
            pawn : pieces.get(configs.defaultSide.pawn),
            rook : pieces.get(configs.defaultSide.rook),
            knight : pieces.get(configs.defaultSide.knight),
            bishop : pieces.get(configs.defaultSide.bishop),
            queen : pieces.get(configs.defaultSide.queen),
            king : pieces.get(configs.defaultSide.king),
        };
}

function newBoard(){
    var size = utils.existy(arguments[0]) ? arguments[0] : 8;
    var array = arguments[1] ? arguments[1] : [];
    if(size>0){
        array.push(_.map(
                _.range(8),
                function(index){
                    return Space.create(vector.create(index, _.size(array)));
                }
            ));
        return newBoard(size-1, array);
    }
    else
        return array;
}

function setLightSide(side, board){
    var baseRow = 0;
    var lightTeam = Piece.lightTeam;
    return setPawns(1, side.pawn, lightTeam,
                setRooks(baseRow, side.rook, lightTeam,
                    setKnights(baseRow, side.knight,lightTeam,
                        setBishops(baseRow, side.bishop,lightTeam,
                            setQueen(baseRow, 0, side.queen, lightTeam,
                                setKing(baseRow,0, side.king, lightTeam, board))))));
}

function setDarkSide(side, board){
    var baseRow = 7;
    var darkTeam = Piece.darkTeam;
    return setPawns(6, side.pawn, darkTeam,
                setRooks(baseRow, side.rook, darkTeam,
                    setKnights(baseRow, side.knight, darkTeam,
                        setBishops(baseRow, side.bishop, darkTeam,
                            setQueen(baseRow, -1, side.queen, darkTeam,
                                setKing(baseRow, 1, side.king, darkTeam, board))))));
}

function setPawns(rowIndex, pieceFac, team, board){
    return createPiecesAt(
        pieceFac,
        board,
        team,
        vector.create(0, rowIndex),
        vector.create(1, rowIndex),
        vector.create(2, rowIndex),
        vector.create(3, rowIndex),
        vector.create(4, rowIndex),
        vector.create(5, rowIndex),
        vector.create(6, rowIndex),
        vector.create(7, rowIndex)
    );
}

function setRooks(rowIndex, pieceFac, team, board){
    return createPiecesAt(
        pieceFac,
        board,
        team,
        vector.create(0, rowIndex),
        vector.create(7, rowIndex)
    );
}

function setKnights(rowIndex, pieceFac, team, board){
    return createPiecesAt(
        pieceFac,
        board,
        team,
        vector.create(1, rowIndex),
        vector.create(6, rowIndex)
    );
}

function setBishops(rowIndex, pieceFac, team, board){
    return createPiecesAt(
        pieceFac,
        board,
        team,
        vector.create(2, rowIndex),
        vector.create(5, rowIndex)
    );
}

function setQueen(rowIndex, offset, pieceFac, team, board){
    return createPiecesAt(
        pieceFac,
        board,
        team,
        vector.create( 4 + offset, rowIndex)
    );
}

function setKing(rowIndex, offset, pieceFac, team, board){
    return createPiecesAt(
        pieceFac,
        board,
        team,
        vector.create(3 + offset, rowIndex)
    );
}


function createPiecesAt(pieceFac, board, team){
    _.each(
        _.rest(arguments, 3),
        createPieceGen(pieceFac, board, team)
    );
    return board;
}

function createPieceGen(pieceFac, board, team){
    return function(vec){
        Space.setPiece(getSpace(board, vec), pieceFac.create(team));
    };
}

function print(board){
    var highlights = _.rest(arguments);
    _.each(board, printRow(highlights));
}

function printRow(highlights){
    return function(row){
        _.each(row, function(space){
            process.stdout.write(spaceString(space, highlights));
        });
        process.stdout.write("\n");
    };
}

function spaceString(space, highlights){
    var highlight = getHighlight(space, highlights);
    var string = '[ ]';
    if(utils.existy(Space.getPiece(space)))
        string = '[' + Piece.getAbbr(Space.getPiece(space)) + ']';
    if(utils.existy(highlight))
        return string[highlight.color];
    else
        return string;
}

function getHighlight(space, highlights){
    return _.find(highlights, function(highlight) {
        return utils.existy(
            _.find(
                highlight.positions, 
                function(position){
                    return vector.isEqual(Space.getLoc(space), position); 
                }
            )
        );
            
    });
}
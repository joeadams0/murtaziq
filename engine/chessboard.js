/**
 * 
 * chessboard.js
 * A basic chessboard
 * 
 * @author Joe Adams
 **/
var utils = require("./utils.js");
var _ = require("underscore");
var configs;
var pieces = require("./pieces.js");
var vector = require("./vector.js");
var Space = require("./space.js");

module.exports = {
    create : create,
    getDefaultSide : getDefaultSide,
    print : print,
    getSpace : getSpace,
    getSize : getSize,
    getPiece : getPiece,
    setPiece : setPiece,
    removePiece : removePiece,
    getEnemySpaces : getEnemySpaces,
    getThreateningPieces : getThreateningPieces,
    getRoyalSpace : getRoyalSpace,
    isOnBoard : isOnBoard,
    getMoves : getMoves
};


function create(config){
    configs = config;
    var lightSide = arguments[1] ? arguments[1] : this.getDefaultSide();
    var darkSide = arguments[2] ? arguments[2] : this.getDefaultSide();
    return setLightSide(lightSide, setDarkSide(darkSide, newBoard()));
}

function getSpace(board, vec){
    if(isOnBoard(board, vec))
        return board[vector.getY(vec)][vector.getX(vec)];
    else 
        return {};
}

function isOnBoard(board, vec){
    return vector.isBounded(vec, vector.create(0,0), getSize(board));
}

function getSize(board){
    if(utils.existy(board[0]))
        return vector.create(_.size(board[0]), _.size(board));
    else
        return vector.create(0, _.size(board));
}

function getPiece(board, vec){
    return Space.getPiece(getSpace(board, vec));
}

function setPiece(board, vec, piece){
    Space.setPiece(getSpace(board, vec), piece);
    return board;
}

function removePiece(board, vec){
    return Space.removePiece(getSpace(board, vec));
}

function getDefaultSide(){
    return {
            pawn : pieces.get(configs, configs.defaultSide.pawn),
            rook : pieces.get(configs, configs.defaultSide.rook),
            knight : pieces.get(configs, configs.defaultSide.knight),
            bishop : pieces.get(configs, configs.defaultSide.bishop),
            queen : pieces.get(configs, configs.defaultSide.queen),
            royal : pieces.get(configs, configs.defaultSide.royal),
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
    var lightTeam = configs.lightTeam;
    return setPawns(1, side.pawn, lightTeam,
                setRooks(baseRow, side.rook, lightTeam,
                    setKnights(baseRow, side.knight,lightTeam,
                        setBishops(baseRow, side.bishop,lightTeam,
                            setQueen(baseRow, 0, side.queen, lightTeam,
                                setRoyal(baseRow, 0, side.royal, lightTeam, board))))));
}

function setDarkSide(side, board){
    var baseRow = 7;
    var darkTeam = configs.darkTeam;
    return setPawns(6, side.pawn, darkTeam,
                setRooks(baseRow, side.rook, darkTeam,
                    setKnights(baseRow, side.knight, darkTeam,
                        setBishops(baseRow, side.bishop, darkTeam,
                            setQueen(baseRow, -1, side.queen, darkTeam,
                                setRoyal(baseRow, 1, side.royal, darkTeam, board))))));
}

function setPawns(rowIndex, piece, team, board){
    return createPiecesAt(
        piece,
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

function setRooks(rowIndex, piece, team, board){
    return createPiecesAt(
        piece,
        board,
        team,
        vector.create(0, rowIndex),
        vector.create(7, rowIndex)
    );
}

function setKnights(rowIndex, piece, team, board){
    return createPiecesAt(
        piece,
        board,
        team,
        vector.create(1, rowIndex),
        vector.create(6, rowIndex)
    );
}

function setBishops(rowIndex, piece, team, board){
    return createPiecesAt(
        piece,
        board,
        team,
        vector.create(2, rowIndex),
        vector.create(5, rowIndex)
    );
}

function setQueen(rowIndex, offset, piece, team, board){
    return createPiecesAt(
        piece,
        board,
        team,
        vector.create(3, rowIndex)
    );
}

function setRoyal(rowIndex, offset, piece, team, board){
    return createPiecesAt(
        piece,
        board,
        team,
        true,
        vector.create(4, rowIndex)
    );
}


function createPiecesAt(piece, board, team, isRoyal){
    var index = 3;
    if(_.isBoolean(isRoyal))
        index = 4;
    _.each(
        _.rest(arguments, index),
        createPieceGen(piece, board, team, isRoyal)
    );
    return board;
}

function createPieceGen(piece, board, team, isRoyal){
    return function(vec){
        Space.setPiece(getSpace(board, vec), new piece(configs, team, isRoyal));
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
        string = '[' + Space.getPiece(space).getAbbr() + ']';
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

function getEnemySpaces(board, space){
    var team = Space.getPiece(space).getTeam();
    return _.filter(_.flatten(board),
            function (space){
                if(utils.existy(Space.getPiece(space)))
                    return Space.getPiece(space).getTeam() != team;
            }
        );
}

function getThreateningPieces(board, source){
    return _.filter(getEnemySpaces(board, source), 
            function(space){
                return _.size(_.find(getMoves(board,space), 
                    function(move){
                        return vector.isEqual(move.getEndLoc(), Space.getLoc(source));
                    }
                )) !== 0;
            }
        );
}

function getRoyalSpace(board, team){
    return _.find(_.flatten(board),
            function(space){
                return utils.existy(Space.getPiece(space)) && 
                        Space.getPiece(space).getTeam() == team &&
                        Space.getPiece(space).isRoyal();
            }
        );
}

function getMoves(board, space){
    if(utils.existy(Space.getPiece(space))){
        return Space.getPiece(space).getMoves(board, space);
    }
    return [];
}
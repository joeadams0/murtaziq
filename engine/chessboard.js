/**
 * 
 * chessboard.js
 * A basic chessboard
 * 
 * @author Joe Adams
 **/
var utils = require("./utils.js");
var pieces = require("./pieces.js");
var vector = require("./vector.js");
var Space = require("./space.js");
var master;
var _ = require("underscore");

module.exports = {
    create : create,
    getDefaultSide : getDefaultSide,
    print : print,
    setSide : setSide,
    getSpace : getSpace,
    getSize : getSize,
    getPiece : getPiece,
    setPiece : setPiece,
    removePiece : removePiece,
    getEnemySpaces : getEnemySpaces,
    getThreateningPieces : getThreateningPieces,
    getRoyalSpace : getRoyalSpace,
    isOnBoard : isOnBoard,
    getMoves : getMoves,
    toJSONObj : toJSONObj,
    loadJSONObj :loadJSONObj,
    toClientJSONObj : toClientJSONObj
};

/**
 * Creates a Chessboard
 * @param  {Function} cb     The call back function 
 * @param  {Object} LightSide The light team's side (optional)
 * @param  {Object} DarkSide The Dark team's side (optional)
 */
function create(){
    var self = this;
    var lightSide = arguments[1] ? arguments[1] : getMaster().getConfigs().defaultSide;
    var darkSide = arguments[2] ? arguments[2] : getMaster().getConfigs().defaultSide;
    var board = newBoard();
    setSide(true, lightSide, board);
    setSide(false, darkSide, board);
    return board;
}

function getMaster () {
    if(!utils.existy(master))
        master = require("./master.js");
    return master;
}

function setSide (isLightSide, side, board) {    
    var success, message;
    var maxValue = getMaster().getConfigs().maxTeamValue;

    var value = getSideValue(side);
    if(validateSideValue(side)){
        if(isLightSide)
            setLightSide(getDefaultSide(side), board);
        else
            setDarkSide(getDefaultSide(side), board);
        success = true;
    }
    else{
        success = false;
        message = "Your total piece value exceeds the total piece value maximum."
    }

    var obj = {};

    obj.success = success;
    if(message)
        obj.data = message;
    else
        obj.data = {
            value : value,
            maxValue : maxValue
        };

    return obj;
}

function validateSideValue(side){
    return getSideValue(side) <= getMaster().getConfigs().maxTeamValue;
}

function getSideValue (side) {
    var value = 0;

    value = value + 8*pieces.getValue(side.pawn);
    value = value + 2*pieces.getValue(side.rook);
    value = value + 2*pieces.getValue(side.knight);
    value = value + 2*pieces.getValue(side.bishop);
    value = value + pieces.getValue(side.queen);
    value = value + pieces.getValue(side.royal);

    return value;
}

/**
 * Gets the space on the board
 * @param  {Object} board The board to look for the space in
 * @param  {Object} vec   The location of the space
 * @return {Object}       The space
 */
function getSpace(board, vec){
    if(isOnBoard(board, vec))
        return board[vector.getY(vec)][vector.getX(vec)];
    else 
        return {};
}

/**
 * Checks if the location is on the given board
 * @param  {Object}  board The board to look for the location on
 * @param  {Object}  vec   The location
 * @return {Boolean}       Returns true if the location is on the board
 */
function isOnBoard(board, vec){
    return vector.isBounded(vec, vector.create(0,0), getSize(board));
}

/**
 * Gets the size of the board
 * @param  {Object} board The board to get the size of.
 * @return {Object}       An object containing the width and height of the board.
 */
function getSize(board){
    if(utils.existy(board[0]))
        return vector.create(_.size(board[0]), _.size(board));
    else
        return vector.create(0, _.size(board));
}

/**
 * Gets the piece at the location
 * @param  {Object} board The board to get the piece from
 * @param  {Object} vec   The location of the desired piece
 * @return {Objcet}       The piece
 */
function getPiece(board, vec){
    return Space.getPiece(getSpace(board, vec));
}

/**
 * Sets the piece at a given location
 * @param {[type]} board The board to set the piece on
 * @param {[type]} vec   The location to set the piece
 * @param {Object} piece The piece to set
 * @return {Object}      The new board
 */
function setPiece(board, vec, piece){
    Space.setPiece(getSpace(board, vec), piece);
    return board;
}

/**
 * Removes a piece from the board
 * @param  {Object} board The chessboard
 * @param  {Object} vec   The location of the piece to remove
 * @return {Object}       The piece that was removed
 */
function removePiece(board, vec){
    return Space.removePiece(getSpace(board, vec));
}

/**
 * Gets the default side
 * @return {Object} The default side
 */
function getDefaultSide(side){
    return {
            pawn : pieces.getConstructor(side.pawn),

            rook : pieces.getConstructor(side.rook),
            knight : pieces.getConstructor(side.knight),
            bishop : pieces.getConstructor(side.bishop),
            queen : pieces.getConstructor(side.queen),
            royal : pieces.getConstructor(side.royal),
        };
}

/**
 * Creates a new board
 * @return {Object} The board
 */
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
    var lightTeam = getMaster().getConfigs().lightTeam;
    return setPawns(1, side.pawn, lightTeam,
                setRooks(baseRow, side.rook, lightTeam,
                    setKnights(baseRow, side.knight,lightTeam,
                        setBishops(baseRow, side.bishop,lightTeam,
                            setQueen(baseRow, 0, side.queen, lightTeam,
                                setRoyal(baseRow, 0, side.royal, lightTeam, board))))));
}

function setDarkSide(side, board){
    var baseRow = 7;
    var darkTeam = getMaster().getConfigs().darkTeam;
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
        "pawn",
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
        "rook",
        vector.create(0, rowIndex),
        vector.create(7, rowIndex)
    );
}

function setKnights(rowIndex, piece, team, board){
    return createPiecesAt(
        piece,
        board,
        team,
        "knight",
        vector.create(1, rowIndex),
        vector.create(6, rowIndex)
    );
}

function setBishops(rowIndex, piece, team, board){
    return createPiecesAt(
        piece,
        board,
        team,
        "bishop",
        vector.create(2, rowIndex),
        vector.create(5, rowIndex)
    );
}

function setQueen(rowIndex, offset, piece, team, board){
    return createPiecesAt(
        piece,
        board,
        team,
        "queen",
        vector.create(3, rowIndex)
    );
}

function setRoyal(rowIndex, offset, piece, team, board){
    return createPiecesAt(
        piece,
        board,
        team,
        "royal",
        vector.create(4, rowIndex)
    );
}


function createPiecesAt(piece, board, team, position){
    _.each(
        _.rest(arguments, 3),
        createPieceGen(piece, board, team, position)
    );
    return board;
}

function createPieceGen(piece, board, team, position){
    return function(vec){
        Space.setPiece(getSpace(board, vec), new piece(team, position));
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
    if(utils.existy(Space.getPiece(space))){
        string = '[' + Space.getPiece(space).getAbbr() + ']';
    }
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

function toJSONObj (board) {
    return _.map(board, function(row) {
        return _.map(row, function(space) {

            return Space.toJSONObj(space);

        });
    });
}

function loadJSONObj (JSONObj) {
    return _.map(JSONObj,function(row) {
        return _.map(row, function(space) {
            return Space.loadJSONObj(space);
        });
    });
}


function toClientJSONObj (board) {
    return _.map(board, function(row) {
        return _.map(row, function(space) {
            return Space.toClientJSONObj(space);
        });
    });
}

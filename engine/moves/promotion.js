var master = require('../master.js');
var Move = master.getMove('normal');

/**
 * Constructor
 * @param  {Object} params The parameters for the move
 */
module.exports = function(params) {
	

    this.__proto__ = new Move(params);

    this.perform = perform;
    this.undo = undo;
    this.toJSONObj = toJSONObj;
    this.toClientJSONObj = toClientJSONObj;

}

/**
 * Perform the promotion, where the piece is replaced with the new piece. Make sure the move count is the same
 * @param  {Object} board The board
 * @return {Object}       The new board
 */
function perform (board) {

}

/**
 * Undos the move
 * @param  {Object} board The board
 * @return {Object}       The new board
 */
function undo (board) {
	
}

/**
 * Produces an object that is JSONifiable and represents the move so that it can be recreated from the JSON
 * @return {Object}          The JSON object
 */
function toJSONObj () {
	var JSONObj = {};
	return JSONObj;
}

/**
 * Produces an object that is JSONifiable and represents the move for rendering
 * @return {Object} The JSON Object
 */
function toClientJSONObj () {
	var JSONObj = {};
	return JSONObj;
}
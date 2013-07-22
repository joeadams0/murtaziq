var Piece = require("./piece.js");
var config = require("./configs/pawnconfig.js");

module.exports = function(configs, team){
    this.__proto__ = new Piece(configs, config.name, config.abbr, team, config.schema);
};

var Piece = require("./piece.js");
var config = require("./configs/kingconfig.js");

module.exports = function(configs, team, isRoyal){
    this.__proto__ = new Piece(configs, config.name, config.abbr, team, config.schema, isRoyal);
};

var piece = require("./piece.js");
var config = require("./configs/knightconfig.js");

var exports = {
    create : create
};

exports.__proto__ = piece;

module.exports = exports;

function create(team){
    return piece.create(config.name, config.abbr, team, config.schema);
}
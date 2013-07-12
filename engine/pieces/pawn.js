var piece = require("./piece.js");
var config = require("./configs/pawnconfig.js");
var Space = require("../space.js");

var exports = {
    create : create
};

exports.__proto__ = piece;

module.exports = exports;

function create(team){
    return piece.create(config.name, config.abbr, team, config.schema);
}


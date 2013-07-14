var piece = require("./piece.js");
var config = require("./configs/kingconfig.js");

var exports = {
    create : create
};

exports.__proto__ = piece;

module.exports = exports;

function create(team, isRoyal){
    return piece.create(config.name, config.abbr, team, config.schema, isRoyal);
}


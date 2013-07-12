
var schema = require("./moveschema");
var vector = require("../../vector.js");
module.exports = {
    name : 'rook',
    abbr : 'r',
    schema : [
        schema.create(vector.create(0, 1), 8, true, true),
        schema.create(vector.create(0, -1), 8, true, true),
        schema.create(vector.create(1, 0), 8, true, true),
        schema.create(vector.create(-1, 0), 8, true, true),
    ]
};
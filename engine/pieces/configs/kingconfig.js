
var schema = require("./moveschema");
var vector = require("../../vector.js");
module.exports = {
    name : 'king',
    abbr : 'k',
    schema : [
        schema.create(vector.create(0, 1), 1, true, true),
        schema.create(vector.create(0, -1), 1, true, true),
        schema.create(vector.create(1, 0), 1, true, true),
        schema.create(vector.create(-1, 0), 1, true, true),
        schema.create(vector.create(1, 1), 1, true, true),
        schema.create(vector.create(1, -1), 1, true, true),
        schema.create(vector.create(-1, 1), 1, true, true),
        schema.create(vector.create(-1, -1), 1, true, true)
    ]
};
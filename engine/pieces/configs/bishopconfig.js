
var schema = require("./moveschema.js");
var vector = require("../../vector.js");
module.exports = {
    name : 'bishop',
    abbr : 'b',
    schema : [
        schema.create(vector.create(1, 1), 12, true, true),
        schema.create(vector.create(1, -1), 12, true, true),
        schema.create(vector.create(-1, 1), 12, true, true),
        schema.create(vector.create(-1, -1), 12, true, true)
    ]
};
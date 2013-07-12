
var schema = require("./moveschema");
var vector = require("../../vector.js");
module.exports = {
    name : 'queen',
    abbr : 'q',
    schema : [
        schema.create(vector.create(0, 1), 8, true, true),
        schema.create(vector.create(0, -1), 8, true, true),
        schema.create(vector.create(1, 0), 8, true, true),
        schema.create(vector.create(-1, 0), 8, true, true),
        schema.create(vector.create(1, 1), 12, true, true),
        schema.create(vector.create(1, -1), 12, true, true),
        schema.create(vector.create(-1, 1), 12, true, true),
        schema.create(vector.create(-1, -1), 12, true, true)
    ]
};
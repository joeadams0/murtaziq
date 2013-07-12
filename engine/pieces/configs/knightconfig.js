var schema = require("./moveschema");
var vector = require("../../vector.js");
module.exports = {
    name : 'knight',
    abbr : 'n',
    schema : [
        schema.create(vector.create(1, 2), 1, true, true),
        schema.create(vector.create(-1, 2), 1, true, true),
        schema.create(vector.create(1, -2), 1, true, true),
        schema.create(vector.create(-1, -2), 1, true, true),
        schema.create(vector.create(2, 1), 1, true, true),
        schema.create(vector.create(-2, 1), 1, true, true),
        schema.create(vector.create(2, -1), 1, true, true),
        schema.create(vector.create(-2, -1), 1, true, true),
    ]
};
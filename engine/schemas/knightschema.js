var schema = require('./moveschema.js');
var vector = require("../vector.js");

module.exports = [
    schema.create(vector.create(1, 2), 1, true, true),
    schema.create(vector.create(-1, 2), 1, true, true),
    schema.create(vector.create(1, -2), 1, true, true),
    schema.create(vector.create(-1, -2), 1, true, true),
    schema.create(vector.create(2, 1), 1, true, true),
    schema.create(vector.create(-2, 1), 1, true, true),
    schema.create(vector.create(2, -1), 1, true, true),
    schema.create(vector.create(-2, -1), 1, true, true),
]
var schema = require('./moveschema.js');
var vector = require("../vector.js");

module.exports = [
    schema.create(vector.create(1, 1), 7, true, true),
    schema.create(vector.create(1, -1), 7, true, true),
    schema.create(vector.create(-1, 1), 7, true, true),
    schema.create(vector.create(-1, -1), 7, true, true),
    schema.create(vector.create(1, 2), 3, true, true),
    schema.create(vector.create(-1, 2), 3, true, true),
    schema.create(vector.create(1, -2), 3, true, true),
    schema.create(vector.create(-1, -2), 3, true, true),
    schema.create(vector.create(2, 1), 3, true, true),
    schema.create(vector.create(-2, 1), 3, true, true),
    schema.create(vector.create(2, -1), 3, true, true),
    schema.create(vector.create(-2, -1), 3, true, true)
]
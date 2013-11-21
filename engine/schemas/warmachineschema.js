var schema = require('./moveschema.js');
var vector = require("../vector.js");

module.exports = [
    schema.create(vector.create(0, 2), 1, true, true),
    schema.create(vector.create(0, -2), 1, true, true),
    schema.create(vector.create(2, 0), 1, true, true),
    schema.create(vector.create(-2, 0), 1, true, true)
]
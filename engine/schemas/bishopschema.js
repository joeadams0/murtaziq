var schema = require('./moveschema.js');
var vector = require("../vector.js");

module.exports = [
    schema.create(vector.create(1, 1), 12, true, true),
    schema.create(vector.create(1, -1), 12, true, true),
    schema.create(vector.create(-1, 1), 12, true, true),
    schema.create(vector.create(-1, -1), 12, true, true)
]
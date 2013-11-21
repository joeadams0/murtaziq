var schema = require('./moveschema.js');
var vector = require("../vector.js");

module.exports = [
    schema.create(vector.create(2, 2), 3, true, true),
    schema.create(vector.create(2, -2), 3, true, true),
    schema.create(vector.create(-2, 2), 3, true, true),
    schema.create(vector.create(-2, -2), 3, true, true)
]
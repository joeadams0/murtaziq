/**
 * User helper - goes in between the controller and model 
 * to accomplish common tasks.
 * 
 **/

var hasher = require("password-hash");
var _ = require("underscore");

var match_queue = [];

function addMatchToQueue (match_id, cb) {
    match_queue.push(match_id);
}

function getNextMatch() {
        if(match_queue == [])
            return -1;
        else
            return match_queue.shift();
}

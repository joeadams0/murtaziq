/**
 * 
 * vector.js
 * Represents a 2d vector for the murtaziq engine. 
 * Use for representing locations on boards
 * 
 * @author Joe Adams
 **/
 
var utils = require("./utils.js");
var _ = require("underscore");
module.exports = {
    create : create,
    add : add,
    subtract : subtract,
    negate : negate,
    getX : getX,
    getY : getY,
    scale : scale,
    isBounded : isBounded,
    isInside : isInside,
    isOutside : isOutside,
    toString : toString,
    isEqual : isEqual,
    reflect : reflect
};

function create(x, y){
    if(_.isNumber(x) && _.isNumber(y))
        return {
            x : x,
            y : y
        };
    else
        utils.fail("Tried to create vector with non-number");
}

function add(vec1, vec2){
    return create(
        getX(vec1) + getX(vec2),
        getY(vec1) + getY(vec2)
    );
}

function subtract(vec1, vec2){
    vec2 = negate(vec2);
    return add(vec1, vec2);
}

function negate(vec){
    return create(
        -getX(vec),
        -getY(vec)
    );
}

function getX(vec){
    return vec.x;
}

function getY(vec){
    return vec.y;
}

function scale(vec, factor){
    return create(
        getX(vec) * factor,
        getY(vec) * factor
    );
}

function isBounded(vec, minVec, maxVec){
    if(isInside(minVec, vec) && isOutside(maxVec, vec))
        return true;
    else
        return false;
}

function isInside(vec, lessVec){
    return getX(vec)<=getX(lessVec) && getY(vec)<=getY(lessVec);
}

function isOutside(vec, greaterVec){
    return getX(vec)>getX(greaterVec) && getY(vec)>getY(greaterVec);
}

function isEqual(vec1, vec2){
    return getX(vec1) == getX(vec2) && getY(vec1) == getY(vec2);
}

function toString(vec){
    return "("+getX(vec)+", "+getY(vec)+")";
}

function reflect(vec){
    return create(-getX(vec), -getY(vec));
}
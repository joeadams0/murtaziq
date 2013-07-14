/**
 * 
 * moveschema.js
 * Describes the scheme for a single move of a piece
 * 
 * @author Joe Adams
 **/
 
var vector = require("../../vector.js");
var _ = require("underscore");

module.exports = {
    create : create,
    getVector : getVector,
    getMaxSteps : getMaxSteps,
    canAttack : canAttack,
    canMove : canMove,
    reflectSchema : reflectSchema,
    getCondition : getCondition
};

function create(vec, maxSteps, canMove, canAttack, condition){
    return {
        vec : vec,
        maxSteps : maxSteps,
        canMove : canMove,
        canAttack : canAttack,
        condition : condition
    };
}

function getVector(schema){
    return schema.vec;
}

function setVector(schema, vec){
    return create(vec, getMaxSteps(schema), canMove(schema), canAttack(schema));
}

function getMaxSteps(schema){
    return schema.maxSteps;
}

function canAttack(schema){
    return schema.canAttack;
}

function canMove(schema){
    return schema.canMove;
}

function getCondition(schema){
    return schema.condition;
}

function reflectSchema(schema){
    if(_.isArray(schema)){
        return _.map(schema, function(simpleschema){
            return reflectSchema(simpleschema);
        });
    }
    else{
        return setVector(schema, vector.reflect(getVector(schema)));
    }
}

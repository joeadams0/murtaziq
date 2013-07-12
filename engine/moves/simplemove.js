
module.exports = {
    create : create,
    getLoc : getLoc,
    getStep : getStep,
    perform : perform
};

function create(loc, step){
    return {
        loc : loc,
        step : step
    };
}

function getLoc(move){
    return move.loc;
}

function getStep(move){
    return move.step;
}

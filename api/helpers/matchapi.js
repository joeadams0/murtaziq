
/**
 * 
 * matchapi.js
 * Controls all interaction between controllers, the database and the match objects
 * 
 * @author Joe Adams
 **/
var engine = require('../../engine/match.js');
var utils = require('../../engine/utils.js');
var _ = require('underscore');
var chathelper = require("./chat-helper.js");
var userhelper = require("./user-helper.js");

 module.exports = {
 	create : create,
 	setPieces : setPieces,
 	getMoves : getMoves,
 	performMove : performMove,
 	surrender : surrender,
 	getMatch : getMatch,
 	getMaxTeamValue : getMaxTeamValue,
 	getAllPieces : getAllPieces,
    getMatch : getMatch,
    addPlayer : addPlayer,
    setPlayer : setPlayer,
    startMatch : startMatch,
    setHost : setHost,
    subscribeSocket : subscribeSocket,
    unsubscribeSocket : unsubscribeSocket,
    removePlayer : removePlayer,
    destroy : destroy,
 };

/**
 * Creates a new Match
 * @param {Function} cb Called when this function is finished. Passes in a status object. If successful, data is the match.
 * @param {Integer}  playerId1 (OPTIONAL) The ID of the light side player.
 * @param {Integer}  playerId2 (OPTIONAL) The ID of the dark side player.
 */
function create (params, cb) {
	Match.create({}).done(function(err, match){
            if(err)
                cb(makeStatus(false, err));
            else{
                if(utils.existy(params.playerId))
                    addPlayerHelper(match, params.playerId, cb);
                cb(makeStatus(true, match.toJSON()));            }
        });
}

function destroy (params, cb) {
    if(!utils.existy(params.matchId)){
        cb(makeStatus(false, "No matchId specified."));
        return;
    }
    if(!utils.existy(params.playerId)){
        cb(makeStatus(false, "No playerId specified."));
        return;
    }

    getMatch(params.matchId, function(err, match) {
        if(err)
            cb(makeStatus(false, err));
        else if(match.host !== params.playerId){
            cb(makeStatus(false, "You are not authorized to perform this action."));
            return;
        }
        else if(match.state != match.getStates()['lobby'])
            cb(makeStatus(false, "You can only disband the game when you are in the lobby."));
        else{
            match.destroy(function(err) {
                if(err)
                    cb(makeStatus(false, err));
                else
                    cb(makeStatus(true, "deleted"));
            });
        }
    });
}

function getMatch (matchId, cb) {
    Match.findOne(matchId).done(function(err, match) {
        if(err)
            cb(err, match);
        else{
            if(!utils.existy(match))
                cb("Match does not exist.", match);
            else
                cb(undefined, match);
        }

    });
}

function addPlayer (params, cb) {
    if(!utils.existy(params.matchId)){
        cb(makeStatus(false, "No matchId specified."));
        return;
    }
    if(!utils.existy(params.playerId)){
        cb(makeStatus(false, "No playerId specified."));
        return;
    }

    getMatch(params.matchId, function(err, match) {
        if(err)
            cb(makeStatus(false, err));
        else 
            addPlayerHelper(match, params.playerId, cb);
    });
}

function setPlayer (params, cb) {
    if(!utils.existy(params.matchId)){
        cb(makeStatus(false, "No params.matchId specified."));
        return;
    }
    if(!utils.existy(params.playerId)){
        cb(makeStatus(false, "No params.playerId specified."));
        return;
    }

    getMatch(params.matchId, function(err, match) {
        if(err)
            cb(makeStatus(false, err));

        else if(match.state == match.getStates()['lobby']){
            var originSide;
            var replacedPlayer;
            // Player hasnt joined
            if(!(match.lightPlayer == params.playerId || match.darkPlayer == params.playerId || _.contains(match.observers, params.playerId))){
                cb(makeStatus(false, "Player has not joined the match."));
                return;
            }
            // Remove player if he is already in a position
            else if(match.lightPlayer == params.playerId)
                originSide = 0;
            else if(match.darkPlayer == params.playerId)
                originSide = 1;
            else {
                originSide = 2;
                match.observers = _.reject(match.observers, function(id) {
                    return id == params.playerId;
                });
            }

            // Set player
            if(params.isLightSide){
                replacedPlayer = match.lightPlayer;
                match.lightPlayer = params.playerId;
            }

            else if(params.isLightSide === false){
                replacedPlayer = match.darkPlayer;
                match.darkPlayer = params.playerId;
            }
            else{
                replacedPlayer = -1;
                match.observers.push(params.playerId);
            }

            // Set Replaced Player
            if(originSide == 0){
                match.lightPlayer = replacedPlayer;
            }

            else if(originSide == 1){
                match.darkPlayer = replacedPlayer;
            }
            else{
                match.observers.push(replacedPlayer);
            }            

            match.save(function(err) {
                if(!err)
                    cb(makeStatus(true, match.toJSON()));
                else
                    cb(makeStatus(false, err));
            });
        }
        else{
            cb(makeStatus(false, "Cannot set players once game has started."));    
        }
    });
}


function removePlayer (params, cb) {
    if(!utils.existy(params.matchId))
        cb(makeStatus(false, "No params.matchId specified."));

    if(!utils.existy(params.playerId))
        cb(makeStatus(false, "No params.playerId specified."));

    else{
        getMatch(params.matchId, function(err, match) {
            if(err)
                cb(makeStatus(false, err));
            
            else if(!(match.lightPlayer == params.playerId || match.darkPlayer == params.playerId || _.contains(match.observers, params.playerId))){
                cb(makeStatus(false, "Player was not in the match."));
            }

            else{
                if(match.state == match.getStates()['lobby']){
                    var substitute = -1;
                    if(_.size(match.observers)>0)
                        substitute = match.observers.pop();

                    if(params.playerId == match.lightPlayer){
                        match.lightPlayer = substitute;
                    }

                    else if(params.playerId == match.darkPlayer)
                        match.darkPlayer = substitute;

                    else {
                        if(substitute > 0)
                            match.observers.push(substitute);

                        match.observers = _.reject(match.observers, function(id) {
                            return id == params.playerId;
                        });
                    }

                    if(match.host == params.playerId){
                        if(match.lightPlayer > 0)
                            match.host = match.lightPlayer;
                        else if(match.darkPlayer > 0)
                            match.host = match.darkPlayer;
                        else if(_.size(match.observers)>0)
                            match.host = match.observers[0];
                    }                

                    match.save(function(err) {
                        if(err)
                            cb(makeStatus(false, err));
                        else
                            cb(makeStatus(true, match));
                    });

                }

                // If game has started, only observers can leave
                else{
                    if(match.lightPlayer == params.playerId || match.darkPlayer == params.playerId)
                        cb(makeStatus(false, "Cannot remove player once the match has started."));
                    else{
                        match.observers = _.reject(match.observers, function(id) {
                            return id == params.playerId;
                        });

                        match.save(function(err) {
                            if(err)
                                cb(makeStatus(false, err));
                            else
                                cb(makeStatus(true, match));
                        });
                    }
                }
            }

        });
    }
}


/**
 * Sets the pieces for a side
 * @param {Integer}  matchId  The ID for the match
 * @param {Integer}  playerId The ID for the player who's side you want to set
 * @param {Object}   pieces   The pieces to set the side to 
 * @param {Function} cb       Called when function is finished. Passes in a status object. If successful, data will be as follows:
 *                            {
 *                            		totalValue : integer,
 *                            		success : boolean // Whether the total value was less than the max value.
 *                            }
 */
function setPieces(params, cb){
    if(!utils.existy(params.matchId))
        cb(makeStatus(false, "No params.matchId specified."));
    
    else if(!utils.existy(params.playerId))
        cb(makeStatus(false, "No params.playerId specified."));
    
    else if(!utils.existy(params.pieces))
        cb(makeStatus(false, "No params.pieces specified."));

    else{
        getMatch(params.matchId, function(err, match) {
            if(err)
                cb(makeStatus(false, err));
            else if(match.state != match.getStates()['pieceSelection'])
                cb(makeStatus(false, "Pieces can only be set when in piece selection."));
            else{

                var isLightSide = match.lightPlayer == params.playerId;

                var m = match.loadedMatch();
                var data = engine.setSide(m, isLightSide, params.pieces );

                match.match = engine.toJSONObj(m);

                if(isLightSide)
                    match.isLightSideReady = true;
                else
                    match.isDarkSideReady = true;

                if(match.isLightSideReady && match.isDarkSideReady){
                    match.state = match.getStates()['playing'];
                }

                match.save(function(err) {
                    if(err)
                        cb(makeStatus(false, err));
                    else
                        cb(makeStatus(true, data));
                });
            }

        });
    }
}

/**
 * Gets the possible moves for a piece
 * @param  {Integer}  matchId  The ID to find the match
 * @param  {Object}   location The location of the piece that you want the moves for
 * @param  {Function} cb       Passes in the status of the request. If successful, data is of this format:
 *                             {
 *                             		loc : {x:x1, y:y1},
 *                             		moves : [...]
 *                             }
 */
function getMoves (params, cb) {
    if(!utils.existy(params.matchId))
        cb(makeStatus(false, "No params.matchId specified."))
    else if(!utils.existy(params.loc))
        cb(makeStatus(false, "No params.loc specified."));

    else 
        getMatch(params.matchId, function(err, match) {
            if(err)
                cb(makeStatus(false, err));
            else if(match.state != match.getStates()['pieceSelection']
                && match.state != match.getStates()['playing'])
                cb(makeStatus(false, "Can only get moves during the match."))
            else {                
                var moves = engine.getMoves(match.loadedMatch(), params.loc);
                cb(makeStatus(true, {
                    loc : params.loc,
                    moves : moves
                }));
            }
        });
    
}

/**
 * Performs a move on the board
 * @param  {Integer}  matchId  The ID for the match
 * @param  {Integer}  playerId The ID for the player requesting the move
 * @param  {Object}   source   The source location of the piece to move
 * @param  {Object}   target   The target location of the piece to move
 * @param  {Function} cb       Passes in the status of the request. If successful, data will be the new match state.
 */
function performMove(params, cb){
    if(!utils.existy(params.matchId))
        cb(makeStatus(false, "No params.matchId specified."));
    if(!utils.existy(params.playerId))
        cb(makeStatus(false, "No params.playerId specified."));
    if(!utils.existy(params.source))
        cb(makeStatus(false, "No params.source specified."));
    if(!utils.existy(params.target))
        cb(makeStatus(false, "No params.target specified."));

    else 
        getMatch(params.matchId, function(err, match) {
            if(err)
                cb(makeStatus(false, err));

            else if(match.state == match.getStates()['playing']){
                if(!(match.lightPlayer == params.playerId || match.darkPlayer == params.playerId))
                    cb(makeStatus(false, "Player is not playing in this game"));
                if(! match.state === match.getStates()['playing'])
                    cb(makeStatus(false, "The game must be being played to make a move."));

                else{
                    var isLightSide = params.playerId == match.lightPlayer;
                    var m = match.loadedMatch();
                    var status = engine.move(m, params.source, params.target, engine.getTeam(isLightSide));

                    if(status.success){
                        match.match = engine.toJSONObj(status.data);

                        match.save(function(err) {
                            if(err)
                                cb(makeStatus(false, err));
                            else{
                                cb(makeStatus(true, match.toJSON()));
                            }
                        });
                    }
                    else
                        cb(makeStatus(false, status.data));
                }
            }
            else{
                cb(makeStatus(false, "Can only make move when the match is being played."))
            }
        });
}

/**
 * Surrenders the game
 * @param  {Integer}  matchId  [description]
 * @param  {Integer}  playerId [description]
 * @param  {Function} cb       Called when surrender is complete. Passes in status of request
 */
function surrender(params, cb){
    if(!utils.existy(params.matchId))
        cb(makeStatus(false, "No params.matchId specified."));
    if(!utils.existy(params.playerId))
        cb(makeStatus(false, "No params.playerId specified."));

    else
        getMatch(params.matchId, function(err, match) {
            if(err)
                cb(makeStatus(false, err));
            // Player is not in the match
            else if(!((match.lightPlayer == params.playerId) || (match.darkPlayer == params.playerId)))
                cb(makeStatus(false, "Player is not playing in this match."));

            else if(match.state != match.getStates()['playing'])
                cb(makeStatus(false, "The game cannot be surrendered if it is not being played."));

            else{
                var otherPlayer = match.lightPlayer;
                if(match.lightPlayer == params.playerId)
                    otherPlayer = match.darkPlayer;

                match.winner = otherPlayer;
                match.state = match.getStates()['surrender'];

                match.save(function(err) {
                    if(err)
                        cb(makeStatus(false, err));
                    else 
                        cb(makeStatus(true, match.toJSON()));                   
                });

            }
        });
}

function setHost (params, cb) {
    if(!utils.existy(params.matchId))
        cb(makeStatus(false, "No params.matchId specified."));
    else if(!utils.existy(params.playerId))
        cb(makeStatus(false, "No params.playerId specified."));
    else
        getMatch(params.matchId, function(err, match) {
            if(err)
                cb(makeStatus(false, err));
            else if(match.state != match.getStates()['lobby'])
                cb(makeStatus(false, "Can only set the host in the lobby."));
            else if(!(match.lightPlayer == params.playerId || match.darkPlayer == params.playerId || _.contains(match.observers, params.playerId))){
                cb(makeStatus(false, "Player is not in the match."))
            }
            else{
                match.host = params.playerId;
    
                match.save(function(err) {
                    if(err)
                        cb(makeStatus(false, err));
                    else
                        cb(makeStatus(true), match.toJSON());
                });
            }
        });

}

function startMatch (matchId, cb) {
    getMatch(matchId, function(err, match) {
        if(err)
            cb(makeStatus(false, err));
        else{
            if(match.lightPlayer < 0 || match.darkPlayer < 0)
                cb(makeStatus(false, "There are not enough players to start this match."));
            else if(match.state != match.getStates()['lobby'])
                cb(makeStatus(false, "This match has already been started."))
            else{
                match.state = match.getStates()['pieceSelection'];

                match.save(function(err) {
                    cb(makeStatus(true, match.toJSON()));
                });
            }
        }
    });
}

/**
 * Gets the max side value
 * @param {Function} cb Called when the function is finished. Passes in a status object. If successful, data will be the match.
 */
function getMaxTeamValue () {
	return engine.getMaxTeamValue();
}

/**
 * Gets all of the pieces
 * @param {Function} cb Called when the function is finished. Passes in a status object. If successful, data will be an array of pieces.
 */
function getAllPieces (){
    return engine.getAllPieces();
}

function subscribeSocket(matchId, socket){
    Match.subscribe(socket, matchId);
}

function unsubscribeSocket(matchId, socket){
    Match.unsubscribe(socket, matchId);
}

function addPlayerHelper (match, playerId, cb) {
    if(match.state == match.getStates()['lobby']){
        if(match.lightPlayer == playerId)
            cb(makeStatus(true, match));
        else if(match.darkPlayer == playerId)
            cb(makeStatus(true, match))
        else if(match.lightPlayer < 0){
            match.lightPlayer = playerId;
            if(match.host < 0)
                match.host = playerId; 
        }
        else if(match.darkPlayer < 0)
            match.darkPlayer = playerId;
        else {
            match.observers.push(playerId);
        }
        match.save(function(err) {
            if(err)
                cb(makeStatus(false, err));
            else{
                cb(makeStatus(true, match.toJSON()));
            }
        });
    }
    else if(isMatchOver(match))
        cb(makeStatus(false, "Cannot join the game when it is over"));
    // If playing, add to observers
    else{
        if(match.lightPlayer == playerId)
            cb(makeStatus(true, match));
        else if(match.darkPlayer == playerId)
            cb(makeStatus(true, match));
        else{
            match.observers.push(playerId);
            match.save(function(err) {
                if(err)
                    cb(makeStatus(false, err));
                else{
                    cb(makeStatus(true, match.toJSON()));
                }
            });
        }
    }
}

function isMatchOver (match) {
    return match.state == match.getStates()['surrender']
        || match.state == match.getStates()['checkmate']
        || match.state == match.getStates()['stalemate'];
}

/**
 * Makes a status object
 * @param  {Boolean} success Was the request successful
 * @param  {Object}  data 	 The data of the status
 * @return {Object}      	 The status object
 */
function makeStatus (success, data) {
	return {
            success : success,
            data : data
        }
}

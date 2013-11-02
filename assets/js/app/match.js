define([], function() {

  var match = {};

  match.createMatch = function(){
    var playerId = $("#player-id").val();
    window.mapi.createMatch({
      playerId : Number(playerId)
    }, function(status) {
      if(status.success){
        $("#main-menu").hide();
        match.state.model.thisPlayer = Number(playerId);
        match.events.newMatch(status.data);
      }
    });
  };

  match.load = function(data, cb){
    if(!cb)
      cb = function() {};
    match.events.newMatch(data, cb);
  };

  match.unload = function() {
    $(match.state.view.boardOptions.svg_container).hide();
  };

  match.joinMatch = function(){
    var playerId = $("#player-id").val();
    var matchId = $("#match-id").val();
    window.mapi.joinMatch({
      playerId : Number(playerId),
      matchId : Number(matchId)
    }, function(status) {
      if(status.success){
        $("#main-menu").hide();
        match.state.model.thisPlayer = Number(playerId);
        match.events.newMatch(status.data);
      }
    });
  };

    // straight re-draw of the board.
  match.render = function(cb){
    if(!cb)
      cb = function() {};
    var boardDimension = match.state.view.svg.attr("width");

    var matchState = match.state.model;

    match.state.view.lightPlayer.html("Light Player: " + matchState.lightPlayer);
    match.state.view.darkPlayer.html("Dark Player: " + matchState.darkPlayer);
    match.state.view.matchId.html("Match Id: " + matchState.id);

    match.state.view.state.html("State: " + matchState.state);

    if(matchState.state === "lobby" && match.state.view.startmatch== undefined){
      match.state.view.startmatch = d3.select(match.state.view.boardOptions.svg_container)
                        .append("button")
                        .html("Start match")
                        .on("click", function() {
                          window.mapi.startMatch({id: matchState.id});
                        });
    }
    else if(matchState.state === "playing" && match.state.view.startmatch ){
      match.state.view.startmatch.remove();
      if(!match.state.view.turn){
        match.state.view.turn = d3.select(match.state.view.boardOptions.svg_container).append("p");
      }
      var turn;
      if(matchState.match.isLightTurn)
        turn = "light player";
      else
        turn = "dark player";
      match.state.view.turn.html("Turn: " + turn);
    }


    if (d3.select("#pieces").node() == null) {
      match.state.view.pieces = match.state.view.svg.append("g").attr("id", "pieces");
      match.state.view.piecesRows = match.state.view.pieces.selectAll("g");
      match.state.view.piecesRows.data(matchState.match.board).enter().append("g").selectAll("image")
                       .data(function(d) {return d;})
                       .enter().append("image")
                       .attr("xlink:href", function(d){ return (d.piece == undefined) ? (""): (match.state.view.piecePath + d.piece.name +" "+(d.piece.team + 1)+".png");})
                       .style("opacity", 0) // initially invisible
                       .attr("height", (boardDimension/8)+"px")
                       .attr("pointer-events", "none")
                       .attr("width", (boardDimension/8)+"px")
                       .attr("x", function(d, i) {return (i % 8)*(boardDimension/8);})
                       .attr("y", function(d, i, j) {return j*(boardDimension/8);})
                       .transition().duration(500).style("opacity", 1); // fade in
    } else {
      var imgs = match.state.view.pieces.selectAll("g").data(matchState.match.board).selectAll("image").data(function(d) {return d;});

      match.state.view.board.selectAll("g")
          .data(matchState.match.board)
          .selectAll("rect")
          .data(function(d) { return d})
          .attr("class", function(d) { 
            if(d.highlight)
              return d.highlight;
            else
              return d3.select(this).attr("tile-color");
          });

      // enter the new images, then update old images+new ones
      imgs.enter().append("image")
           .attr("height", (boardDimension/8)+"px")
           .attr("width", (boardDimension/8)+"px")
           .attr("pointer-events", "none");
      // enter + update
      imgs.attr("xlink:href", function(d){ return (d.piece == undefined) ? (""): (match.state.view.piecePath + d.piece.name +" "+(d.piece.team + 1)+".png");})
           .attr("x", function(d, i) {return (i % 8)*(boardDimension/8);})
           .attr("y", function(d, i, j) {return j*(boardDimension/8);})
           .attr("pointer-events", "none");
      // exit the rest
      imgs.exit().remove();
    }
    d3.selectAll("image").select(function(d) {return (d.piece == undefined) ? (this) : null ;}).remove();

    cb();
};

  match.drawTextmatch = function(matchState){
    matchState = JSON.parse(matchState);
    if (!match.state.view.isBoardCreated() || !match.state.view.boardIsText()) {
      match.init.board({text:true});
      match.state.view.textRows = match.state.view.board.selectAll("tr")
                                .data(matchState)
                                .enter().append("tr");

      var td = match.state.view.textRows.selectAll("td")
          .data(function(d) { return d; })
          .enter().append("td")
          .text(function(d) { return (d.piece == undefined) ? ("") : (d.piece.name); })
          .attr("class", function(d){ 
            if (d.piece == undefined) return "";
            return (d.piece.team == 1) ? ("black") : ("white");
          }).style("background-color", function(d, i, j) {
            return ((j+i)%2 == 0) ? ("#D6C8A7") : ("#9E8B5D");
          });
    } else {
      match.state.view.textRows = match.state.view.board.selectAll("tr")
                                .data(matchState);

      var td = match.state.view.textRows.selectAll("td")
          .data(function(d) { return d; })
          .text(function(d) { return (d.piece == undefined) ? ("") : (d.piece.name); })
          .attr("class", function(d){ 
            if (d.piece == undefined) return "";
            return (d.piece.team == 1) ? ("black") : ("white");
          });
    }
  };
  // only works for svg matchs
  match.move = function(initialState, move){
    if (match.state.view.isBoardCreated() && !match.state.view.boardIsText()){
      match.draw.fromBoardState(initialState);
      move = JSON.parse(move);
      var boardDimension = match.state.view.svg.attr("width");

      match.state.view.pieces.selectAll("image").select(function() {
        return (this.x.baseVal.value/90 == move.source.x && this.y.baseVal.value/90 == move.source.y) ? this : null;
      }).transition().duration(500)
                     .attr("x", move.target.x * (boardDimension/8))
                     .attr("y", move.target.y * (boardDimension/8));
      return "piece drawn";
    } else {
      return "nope, you're dumb";
    }
  };

  // EVENT handlers

  match.events = {};

  match.events.spaceClicked = function(x,y) {
    var highlightMoves = true;

    // If trying to move
    if(match.state.model.selectedLoc && match.state.model.possibleMoves){
      _.each(match.state.model.possibleMoves, function(move) {
        if( (match.state.model.selectedLoc.x === move.source.x && match.state.model.selectedLoc.y === move.source.y) && (x === move.target.x && y === move.target.y)){
          match.events.moveAttempt(move.source, move.target);
          highlightMoves = false;
        }
      });
    }

    match.state.model.removeHighlights();
    match.state.model.selectedLoc = undefined;

    
    // If highlight possible moves
    if(highlightMoves && match.state.model.getSpace(x,y).piece)
      window.mapi.getMoves({
        id : match.state.model.id,
        loc : {
          x : x,
          y : y
        }
      }, function(status) {
        if(status.success){
          match.state.model.selectedLoc = status.data.loc;
          match.state.model.possibleMoves = status.data.moves;

          match.state.model.getSpace(status.data.loc.x, status.data.loc.y).highlight = "selected-highlight"

          _.each(status.data.moves, function(move) {
            // Friendly moves
            if((move.isLightTeam && match.state.model.thisPlayer === match.state.model.lightPlayer)||
                (!move.isLightTeam && match.state.model.thisPlayer === match.state.model.darkPlayer)){

              match.state.model.getSpace(move.target.x, move.target.y).highlight = "friendly-highlight";
            }
            // Enemy Moves
            else if((move.isLightTeam && match.state.model.thisPlayer === match.state.model.darkPlayer)||
                (!move.isLightTeam && match.state.model.thisPlayer === match.state.model.lightPlayer)){

              match.state.model.getSpace(move.target.x, move.target.y).highlight = "enemy-highlight";
            }
            // Observer Moves
            else{
              match.state.model.getSpace(move.target.x, move.target.y).highlight = "neutral-highlight";
            }
          });


          match.render();
        }
      });
    else{
      match.render();
    }
  };

  match.events.moveAttempt = function(source, target) {
    window.mapi.performMove({
      matchId : match.state.model.id,
      playerId : match.state.model.thisPlayer,
      source : source,
      target : target,
    }, function(status) {
      if(!status.success)
        alert(status.data);
    });
  };

  match.events.updateState = function(state, cb) {

    if(!cb)
      cb = function() {};

    _.each(state, function(el, key) {
      match.state.model[key] = el;
    });
    // var model = match.state.model;
    // var match = state.match;
    // var obs = state.observers;

    // state.match = undefined;
    // state.observers = undefined;

    // // Match turn
    // if(model.isLightTurn !== undefined && model.isLightTurn !== match.isLightTurn){
    //   model.isLightTurn.value = match.isLightTurn;
    //   model.isLightTurn.hasChanged = true;
    // }

    // // Match board
    // // Rows
    // _.each(match.board, function(row, y, list) {
    //   // Spaces
    //   _.each(row function(newSpace, x) {

    //     var oldSpace = model.board[x][y];

    //     if(newSpace.piece && oldSpace.piece){
    //       // Go thru each member and see if it has changed
    //       var hasChanged = _.every(newSpace.piece, function(element, key) {
    //         return oldSpace[key] !== undefined || oldSpace[key].value !== element;
    //       });          

    //       if(hasChanged){
    //         oldSpace.piece = newSpace.piece;
    //         oldSpace.hasChanged = true;
    //       }

    //     }
    //     else if(newSpace.piece || oldSpace.piece){
    //         oldSpace.piece = newSpace.piece;
    //         oldSpace.hasChanged = true;
    //     }
        
    //   });
    // });

    // // Match history
    

    // // Normal State
    // _.each(state, function(value, key, list) {
    //   if(model[key] && value !== model[key].value){
    //       model[key].value = value;
    //       model[key].hasChanged = true;
    //     }
    //   }
    // });

    match.render(cb);
  };

  match.events.newMatch = function(state, cb) {

    if(!cb)
      cb = function() {};

    match.init.board(function() {
      match.events.updateState(state, cb);
    });
  };


  match.init = {};
    /* match.init.options = {
         svg_container: selector,
         dimension: integer,
         duration: integer (ms),
         fold: boolean,
         text: boolean
       };
    */
   

  match.init.board = function(cb, options){
    var return_status = "board created";
    // parse options
    if (options == undefined){
      options = {};
      options.svg_container = "body";
      options.dimension = 720;
      options.duration = 2000;
      options.fold = true;
      options.text = false;
      options.moveHighlightColor = "green";      
    } else {
      if (options.svg_container == undefined) options.svg_container = "body";
      if (options.dimension == undefined) options.dimension = 720;
      if (options.duration == undefined) options.duration = 2000; // 2 seconds
      if (options.fold != false) options.fold = true;
      if (options.text != true) options.text = false;
    }
    // save the options we used so we can use the same ones to end
    match.state.view.boardOptions = options;

    if (match.state.view.isBoardCreated()) {
      d3.select('#match').remove();
    }

    if (options.text){
      match.state.view.svg = {};
      match.state.view.board = d3.select(options.svg_container)
                           .append("table")
                           .attr("id", "match");
      return "text board created";
    }

    match.state.view.svg = d3.select(options.svg_container).append("svg")
                       .attr("id", "match")
                       .attr("opacity", 0)
                       .attr("width", 0)
                       .attr("height", 0);

    match.state.view.lightPlayer = d3.select(options.svg_container)
                        .append("p");

    match.state.view.darkPlayer = d3.select(options.svg_container)
                        .append("p");

    match.state.view.matchId = d3.select(options.svg_container)
                        .append("p");

    match.state.view.state = d3.select(options.svg_container)
                        .append("p");


    match.state.view.board = match.state.view.svg.append("g").attr("id", "board");
    match.state.view.board.selectAll("g")
                    .data([[1,0,1,0,1,0,1,0],
                           [0,1,0,1,0,1,0,1],
                           [1,0,1,0,1,0,1,0],
                           [0,1,0,1,0,1,0,1],
                           [1,0,1,0,1,0,1,0],
                           [0,1,0,1,0,1,0,1],
                           [1,0,1,0,1,0,1,0],
                           [0,1,0,1,0,1,0,1]])
                    .enter().append("g")
                    .selectAll("rect").data(function(d) {return d;})
                    .enter().append("rect")
                    .on("click", function() {
                      var space = d3.select(this);
                      console.log({x: space.attr("x")/space.attr("width"), y :  space.attr("y")/space.attr("height")});
                      match.events.spaceClicked(space.attr("x")/space.attr("width"), space.attr("y")/space.attr("height"));
                    })
                    .attr("x", function(d, i) {return (i % 8)*(options.dimension/8);})
                    .attr("y", function(d, i, j) {return j*(options.dimension/8);})
                    .attr("width", options.dimension/8)
                    .attr("height", options.dimension/8)
                    .attr("class", function(d) {return (d == 1) ? ("dark") : ("light");})
                    .attr("tile-color", function(d) {return (d == 1) ? ("dark") : ("light");});

    //animations to show the board
    if (options.fold){
      match.state.view.svg.transition().duration(options.duration/3)
                    .style("opacity", 1)
                    .attr("width", options.dimension/2)
                    .attr("height", options.dimension/2);
      match.state.view.svg.transition().duration(options.duration/3).delay(options.duration/3)
                    .attr("height", options.dimension);
      match.state.view.svg.transition().duration(options.duration/3).delay(2*options.duration/3)
                    .attr("width", options.dimension)
                    .each("end", cb);
    } else {
      match.state.view.svg.transition().duration(options.duration)
                    .style("opacity", 1)
                    .attr("width", options.dimension)
                    .attr("height", options.dimension)
                    .each("end", cb);
    }

    return return_status;
  };

  // CLEANUP functions

  match.end = {};
  /*
    match.end.options = {
      duration: integer
      fold: boolean
      text: boolean
    };
  */
  // if you don't pass options, it will try to use the saved options, or revert to defaults
  match.end.board =  function(options){
    if (options == undefined){
      options = {};
      if (match.state.view.boardOptions == undefined){
        options.duration = 2000;
        options.fold = true;
        options.text = false;
      } else {
        options = match.state.view.boardOptions;
      }
    } else {
      if (options.duration == undefined) options.duration = 2000; // 2 seconds
      if (options.fold != false) options.fold = true;
      if (options.text != true) options.text = false;
    }
    
    if (options.text){
      match.state.view.board.remove();
      match.state.view.board = {};
      match.state.view.svg = {};

      return "text board removed";
    }

    var width = match.state.view.svg.attr("width");

    if (options.fold) {
      match.state.view.svg.transition().duration(options.duration/3)
                    .attr("width", width/2);
      match.state.view.svg.transition().duration(options.duration/3).delay(options.duration/3)
                    .attr("height", width/2);
      match.state.view.svg.transition().duration(options.duration/3).delay(2*options.duration/3)
                    .style("opacity", 0)
                    .attr("width", 0)
                    .attr("height", 0)
                    .remove();
    } else {
      match.state.view.svg.transition().duration(options.duration)
                    .style("opacity", 0)
                    .attr("width", 0)
                    .attr("height", 0)
                    .remove();
    }
    match.state.view.board = {};
    match.state.view.svg = {};

    return "board removed";
  };

  // STATE Tracking Functions

  match.state = {};

  // Contains all things relating to the rendering of the state
  match.state.view = {};

  match.state.view.isBoardCreated = function(){
    return d3.select("#match").node() != null;
  };

  match.state.view.boardIsText = function(){
    return !Array.isArray(match.state.view.svg);
  };

  match.state.view.svg = {};

  match.state.view.board = {};

  // boardOptions is not initialized, because 'undefined' has meaning.
  match.state.view.piecePath = "./images/pieces/";

  // MODEL

  // Contains the data for the view
  match.state.model = {};

  match.state.model.getSpace = function(x, y) {
    if(!match.state.model.match.board)
      return undefined;
    else
      return match.state.model.match.board[y][x];
  };

  match.state.model.removeHighlights = function() {
    match.state.model.possibleMoves = undefined;
    _.each(match.state.model.match.board, function(row) {
      _.each(row, function(space) {
        space.highlight = undefined;
      });
    });
  };

  return match;

});

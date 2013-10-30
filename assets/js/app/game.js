
var host = 'http://localhost:1337';

var socket = io.connect(host);

socket.on('connect', function() {

  socket.on('message', function(message) {
    console.log(message);
    game.events.updateState(message.data);
  });

  window.createMApi(socket);


});

var game = {
  createMatch : function(){
    var playerId = $("#player-id").val();
    window.mapi.createMatch({
      playerId : Number(playerId)
    }, function(status) {
      if(status.success){
        $("#main-menu").hide();
        game.state.model.thisPlayer = Number(playerId);
        game.events.newMatch(status.data);
      }
    });
  },

  joinMatch : function(){
    var playerId = $("#player-id").val();
    var matchId = $("#match-id").val();
    window.mapi.joinMatch({
      playerId : Number(playerId),
      matchId : Number(matchId)
    }, function(status) {
      if(status.success){
        $("#main-menu").hide();
        game.state.model.thisPlayer = Number(playerId);
        game.events.newMatch(status.data);
      }
    });
  },

  // straight re-draw of the board.
  render: function(){
    var boardDimension = game.state.view.svg.attr("width");

    var gameState = game.state.model;

    game.state.view.lightPlayer.html("Light Player: " + gameState.lightPlayer);
    game.state.view.darkPlayer.html("Dark Player: " + gameState.darkPlayer);
    game.state.view.matchId.html("Match Id: " + gameState.id);

    game.state.view.state.html("State: " + gameState.state);

    if(gameState.state === "lobby" && game.state.view.startGame== undefined){
      game.state.view.startGame = d3.select(game.state.view.boardOptions.svg_container)
                        .append("button")
                        .html("Start Game")
                        .on("click", function() {
                          window.mapi.startMatch({id: gameState.id});
                        });
    }
    else if(gameState.state === "playing" && game.state.view.startGame ){
      game.state.view.startGame.remove();
      if(!game.state.view.turn){
        game.state.view.turn = d3.select(game.state.view.boardOptions.svg_container).append("p");
      }
      var turn;
      if(gameState.match.isLightTurn)
        turn = "light player";
      else
        turn = "dark player";
      game.state.view.turn.html("Turn: " + turn);
    }


    if (d3.select("#pieces").node() == null) {
      game.state.view.pieces = game.state.view.svg.append("g").attr("id", "pieces");
      game.state.view.piecesRows = game.state.view.pieces.selectAll("g");
      game.state.view.piecesRows.data(gameState.match.board).enter().append("g").selectAll("image")
                       .data(function(d) {return d;})
                       .enter().append("image")
                       .attr("xlink:href", function(d){ return (d.piece == undefined) ? (""): (game.state.view.piecePath + d.piece.name +" "+(d.piece.team + 1)+".png");})
                       .style("opacity", 0) // initially invisible
                       .attr("height", (boardDimension/8)+"px")
                       .attr("pointer-events", "none")
                       .attr("width", (boardDimension/8)+"px")
                       .attr("x", function(d, i) {return (i % 8)*(boardDimension/8);})
                       .attr("y", function(d, i, j) {return j*(boardDimension/8);})
                       .transition().duration(500).style("opacity", 1); // fade in
    } else {
      var imgs = game.state.view.pieces.selectAll("g").data(gameState.match.board).selectAll("image").data(function(d) {return d;});

      game.state.view.board.selectAll("g")
          .data(gameState.match.board)
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
      imgs.attr("xlink:href", function(d){ return (d.piece == undefined) ? (""): (game.state.view.piecePath + d.piece.name +" "+(d.piece.team + 1)+".png");})
           .attr("x", function(d, i) {return (i % 8)*(boardDimension/8);})
           .attr("y", function(d, i, j) {return j*(boardDimension/8);})
           .attr("pointer-events", "none");
      // exit the rest
      imgs.exit().remove();
    }
    d3.selectAll("image").select(function(d) {return (d.piece == undefined) ? (this) : null ;}).remove();
    return "drawn";
  },

  draw: {

    /*textGame: function(gameState){
      gameState = JSON.parse(gameState);
      if (!game.state.view.isBoardCreated() || !game.state.view.boardIsText()) {
        game.init.board({text:true});
        game.state.view.textRows = game.state.view.board.selectAll("tr")
                                  .data(gameState)
                                  .enter().append("tr");

        var td = game.state.view.textRows.selectAll("td")
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
        game.state.view.textRows = game.state.view.board.selectAll("tr")
                                  .data(gameState);

        var td = game.state.view.textRows.selectAll("td")
            .data(function(d) { return d; })
            .text(function(d) { return (d.piece == undefined) ? ("") : (d.piece.name); })
            .attr("class", function(d){ 
              if (d.piece == undefined) return "";
              return (d.piece.team == 1) ? ("black") : ("white");
            });
      }
    },
    // straight re-draw of the board.
    // gameState is simply the Array of Arrays of Objects of piece Objects
    fromBoardState: function(gameState){
      var boardDimension = game.state.view.svg.attr("width");

      game.state.view.lightPlayer.html("Light Player: " + gameState.lightPlayer);
      game.state.view.darkPlayer.html("Dark Player: " + gameState.darkPlayer);
      game.state.view.matchId.html("Match Id: " + gameState.id);
      game.state.view.id = gameState.id;

      game.state.view.state.html("State: " + gameState.state);

      if(gameState.state === "lobby" && game.state.view.startGame== undefined){
        game.state.view.startGame = d3.select(game.state.view.boardOptions.svg_container)
                          .append("button")
                          .html("Start Game")
                          .on("click", function() {
                            window.mapi.startMatch({id: gameState.id});
                          });
      }
      else if(gameState.state === "playing" && game.state.view.startGame ){
        game.state.view.startGame.remove();
      }


      if (d3.select("#pieces").node() == null) {
        game.state.view.pieces = game.state.view.svg.append("g").attr("id", "pieces");
        game.state.view.piecesRows = game.state.view.pieces.selectAll("g");
        game.state.view.piecesRows.data(gameState.match.board).enter().append("g").selectAll("image")
                         .data(function(d) {return d;})
                         .enter().append("image")
                         .attr("xlink:href", function(d){ return (d.piece == undefined) ? (""): (game.state.view.piecePath + d.piece.name +" "+(d.piece.team + 1)+".png");})
                         .style("opacity", 0) // initially invisible
                         .attr("height", (boardDimension/8)+"px")
                         .attr("pointer-events", "none")
                         .attr("width", (boardDimension/8)+"px")
                         .attr("x", function(d, i) {return (i % 8)*(boardDimension/8);})
                         .attr("y", function(d, i, j) {return j*(boardDimension/8);})
                         .transition().duration(500).style("opacity", 1); // fade in
      } else {
        var imgs = game.state.view.pieces.selectAll("g").data(gameState.match.board).selectAll("image").data(function(d) {return d;});

        // enter the new images, then update old images+new ones
        imgs.enter().append("image")
             .attr("height", (boardDimension/8)+"px")
             .attr("width", (boardDimension/8)+"px");
        // enter + update
        imgs.attr("xlink:href", function(d){ return (d.piece == undefined) ? (""): (game.state.view.piecePath + d.piece.name +" "+(d.piece.team + 1)+".png");})
             .attr("x", function(d, i) {return (i % 8)*(boardDimension/8);})
             .attr("y", function(d, i, j) {return j*(boardDimension/8);});
        // exit the rest
        imgs.exit().remove();
      }
      d3.selectAll("image").select(function(d) {return (d.piece == undefined) ? (this) : null ;}).remove();
      return "drawn";
    },
    all: function(data){
      //draw the board
      if (!game.state.view.isBoardCreated())
        game.init.board();
      game.draw.fromBoardState(data);
    },
    // only works for svg games
    move: function(initialState, move){
      if (game.state.view.isBoardCreated() && !game.state.view.boardIsText()){
        game.draw.fromBoardState(initialState);
        move = JSON.parse(move);
        var boardDimension = game.state.view.svg.attr("width");

        game.state.view.pieces.selectAll("image").select(function() {
          return (this.x.baseVal.value/90 == move.source.x && this.y.baseVal.value/90 == move.source.y) ? this : null;
        }).transition().duration(500)
                       .attr("x", move.target.x * (boardDimension/8))
                       .attr("y", move.target.y * (boardDimension/8));
        return "piece drawn";
      } else {
        return "nope, you're dumb";
      }
    }*/
  },

  events : {
    spaceClicked : function(x,y) {
      var highlightMoves = true;

      // If trying to move
      if(game.state.model.selectedLoc && game.state.model.possibleMoves){
        _.each(game.state.model.possibleMoves, function(move) {
          if( (game.state.model.selectedLoc.x === move.source.x && game.state.model.selectedLoc.y === move.source.y) && (x === move.target.x && y === move.target.y)){
            game.events.moveAttempt(move.source, move.target);
            highlightMoves = false;
          }
        });
      }

      game.state.model.removeHighlights();
      game.state.model.selectedLoc = undefined;

      
      // If highlight possible moves
      if(highlightMoves && game.state.model.getSpace(x,y).piece)
        window.mapi.getMoves({
          id : game.state.model.id,
          loc : {
            x : x,
            y : y
          }
        }, function(status) {
          if(status.success){
            game.state.model.selectedLoc = status.data.loc;
            game.state.model.possibleMoves = status.data.moves;

            game.state.model.getSpace(status.data.loc.x, status.data.loc.y).highlight = "selected-highlight"

            _.each(status.data.moves, function(move) {
              // Friendly moves
              if((move.isLightTeam && game.state.model.thisPlayer === game.state.model.lightPlayer)||
                  (!move.isLightTeam && game.state.model.thisPlayer === game.state.model.darkPlayer)){

                game.state.model.getSpace(move.target.x, move.target.y).highlight = "friendly-highlight";
              }
              // Enemy Moves
              else if((move.isLightTeam && game.state.model.thisPlayer === game.state.model.darkPlayer)||
                  (!move.isLightTeam && game.state.model.thisPlayer === game.state.model.lightPlayer)){

                game.state.model.getSpace(move.target.x, move.target.y).highlight = "enemy-highlight";
              }
              // Observer Moves
              else{
                game.state.model.getSpace(move.target.x, move.target.y).highlight = "neutral-highlight";
              }
            });


            game.render();
          }
        });
      else{
        game.render();
      }
    },
    moveAttempt : function(source, target) {
      window.mapi.performMove({
        matchId : game.state.model.id,
        playerId : game.state.model.thisPlayer,
        source : source,
        target : target,
      }, function(status) {
        if(!status.success)
          alert(status.data);
      });
    },
    updateState : function(state) {

      _.each(state, function(el, key) {
        game.state.model[key] = el;
      });
      // var model = game.state.model;
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

      game.render();
    },

    newMatch : function(state) {
      game.init.board(function() {
        game.events.updateState(state);
      });
    }
  },
  init: {
    /* options = {
         svg_container: selector,
         dimension: integer,
         duration: integer (ms),
         fold: boolean,
         text: boolean
       }
    */
    board: function(cb, options){
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
      game.state.view.boardOptions = options;

      if (game.state.view.isBoardCreated()) {
        d3.select('#game').remove();
      }

      if (options.text){
        game.state.view.svg = {};
        game.state.view.board = d3.select(options.svg_container)
                             .append("table")
                             .attr("id", "game");
        return "text board created";
      }

      game.state.view.svg = d3.select(options.svg_container).append("svg")
                         .attr("id", "game")
                         .attr("opacity", 0)
                         .attr("width", 0)
                         .attr("height", 0);

      game.state.view.lightPlayer = d3.select(options.svg_container)
                          .append("p");

      game.state.view.darkPlayer = d3.select(options.svg_container)
                          .append("p");

      game.state.view.matchId = d3.select(options.svg_container)
                          .append("p");

      game.state.view.state = d3.select(options.svg_container)
                          .append("p");


      game.state.view.board = game.state.view.svg.append("g").attr("id", "board");
      game.state.view.board.selectAll("g")
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
                        game.events.spaceClicked(space.attr("x")/space.attr("width"), space.attr("y")/space.attr("height"));
                      })
                      .attr("x", function(d, i) {return (i % 8)*(options.dimension/8);})
                      .attr("y", function(d, i, j) {return j*(options.dimension/8);})
                      .attr("width", options.dimension/8)
                      .attr("height", options.dimension/8)
                      .attr("class", function(d) {return (d == 1) ? ("dark") : ("light");})
                      .attr("tile-color", function(d) {return (d == 1) ? ("dark") : ("light");});

      //animations to show the board
      if (options.fold){
        game.state.view.svg.transition().duration(options.duration/3)
                      .style("opacity", 1)
                      .attr("width", options.dimension/2)
                      .attr("height", options.dimension/2);
        game.state.view.svg.transition().duration(options.duration/3).delay(options.duration/3)
                      .attr("height", options.dimension);
        game.state.view.svg.transition().duration(options.duration/3).delay(2*options.duration/3)
                      .attr("width", options.dimension)
                      .each("end", cb);
      } else {
        game.state.view.svg.transition().duration(options.duration)
                      .style("opacity", 1)
                      .attr("width", options.dimension)
                      .attr("height", options.dimension)
                      .each("end", cb);
      }

      return return_status;
    }
  },
  end: {
    /*
      options = {
        duration: integer
        fold: boolean
        text: boolean
      }
    */
    // if you don't pass options, it will try to use the saved options, or revert to defaults
    board: function(options){
      if (options == undefined){
        options = {};
        if (game.state.view.boardOptions == undefined){
          options.duration = 2000;
          options.fold = true;
          options.text = false;
        } else {
          options = game.state.view.boardOptions;
        }
      } else {
        if (options.duration == undefined) options.duration = 2000; // 2 seconds
        if (options.fold != false) options.fold = true;
        if (options.text != true) options.text = false;
      }
      
      if (options.text){
        game.state.view.board.remove();
        game.state.view.board = {};
        game.state.view.svg = {};

        return "text board removed";
      }

      var width = game.state.view.svg.attr("width");

      if (options.fold) {
        game.state.view.svg.transition().duration(options.duration/3)
                      .attr("width", width/2);
        game.state.view.svg.transition().duration(options.duration/3).delay(options.duration/3)
                      .attr("height", width/2);
        game.state.view.svg.transition().duration(options.duration/3).delay(2*options.duration/3)
                      .style("opacity", 0)
                      .attr("width", 0)
                      .attr("height", 0)
                      .remove();
      } else {
        game.state.view.svg.transition().duration(options.duration)
                      .style("opacity", 0)
                      .attr("width", 0)
                      .attr("height", 0)
                      .remove();
      }
      game.state.view.board = {};
      game.state.view.svg = {};

      return "board removed";
    }
  },
  state: {
    // Contains all things relating to the rendering of the state
    view : {
      isBoardCreated: function(){
        return d3.select("#game").node() != null;
      },
      boardIsText: function(){
        return !Array.isArray(game.state.view.svg);
      },
      svg: {},
      board: {},
      // boardOptions is not initialized, because 'undefined' has meaning.
      piecePath: "./images/pieces/"
    },

    // Contains the data for the view
    model : {
      getSpace : function(x, y) {
        if(!game.state.model.match.board)
          return undefined;
        else
          return game.state.model.match.board[y][x];
      },
      removeHighlights : function() {
        game.state.model.possibleMoves = undefined;
        _.each(game.state.model.match.board, function(row) {
          _.each(row, function(space) {
            space.highlight = undefined;
          });
        });
      }, 
    }
  },

};

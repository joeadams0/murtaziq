var game = {
  draw: {
    textGame: function(gameState){
      gameState = JSON.parse(gameState);
      if (!game.state.isBoardCreated() || !game.state.boardIsText()) {
        game.init.board({text:true});
        game.state.textRows = game.state.board.selectAll("tr")
                                  .data(gameState)
                                  .enter().append("tr");

        var td = game.state.textRows.selectAll("td")
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
        game.state.textRows = game.state.board.selectAll("tr")
                                  .data(gameState);

        var td = game.state.textRows.selectAll("td")
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
      gameState = JSON.parse(gameState);
      var boardDimension = game.state.svg.attr("width");
      if (d3.select("#pieces").node() == null) {
        game.state.pieces = game.state.svg.append("g").attr("id", "pieces");
        game.state.piecesRows = game.state.pieces.selectAll("g");
        game.state.piecesRows.data(gameState).enter().append("g").selectAll("image")
                         .data(function(d) {return d;})
                         .enter().append("image")
                         .attr("xlink:href", function(d){ return (d.piece == undefined) ? (""): (game.state.piecePath + d.piece.name +" "+(d.piece.team + 1)+".png");})
                         .style("opacity", 0) // initially invisible
                         .attr("height", (boardDimension/8)+"px")
                         .attr("width", (boardDimension/8)+"px")
                         .attr("x", function(d, i) {return (i % 8)*(boardDimension/8);})
                         .attr("y", function(d, i, j) {return j*(boardDimension/8);})
                         .transition().duration(500).style("opacity", 1); // fade in
      } else {
        var imgs = game.state.pieces.selectAll("g").data(gameState).selectAll("image").data(function(d) {return d;});

        // enter the new images, then update old images+new ones
        imgs.enter().append("image")
             .attr("height", (boardDimension/8)+"px")
             .attr("width", (boardDimension/8)+"px");
        // enter + update
        imgs.attr("xlink:href", function(d){ return (d.piece == undefined) ? (""): (game.state.piecePath + d.piece.name +" "+(d.piece.team + 1)+".png");})
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
      if (!game.state.isBoardCreated())
        game.init.board();
      game.draw.fromBoardState(data);
    },
    // only works for svg games
    move: function(initialState, move){
      if (game.state.isBoardCreated() && !game.state.boardIsText()){
        game.draw.fromBoardState(initialState);
        move = JSON.parse(move);
        var boardDimension = game.state.svg.attr("width");

        game.state.pieces.selectAll("image").select(function() {
          return (this.x.baseVal.value/90 == move.source.x && this.y.baseVal.value/90 == move.source.y) ? this : null;
        }).transition().duration(500)
                       .attr("x", move.target.x * (boardDimension/8))
                       .attr("y", move.target.y * (boardDimension/8));
        return "piece drawn";
      } else {
        return "nope, you're dumb";
      }
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
    board: function(options){
      var return_status = "board created";
      // parse options
      if (options == undefined){
        options = {};
        options.svg_container = "body";
        options.dimension = 720;
        options.duration = 2000;
        options.fold = true;
        options.text = false;
      } else {
        if (options.svg_container == undefined) options.svg_container = "body";
        if (options.dimension == undefined) options.dimension = 720;
        if (options.duration == undefined) options.duration = 2000; // 2 seconds
        if (options.fold != false) options.fold = true;
        if (options.text != true) options.text = false;
      }
      // save the options we used so we can use the same ones to end
      game.state.boardOptions = options;

      if (game.state.isBoardCreated()) {
        d3.select('#game').remove();
      }

      if (options.text){
        game.state.svg = {};
        game.state.board = d3.select(options.svg_container)
                             .append("table")
                             .attr("id", "game");
        return "text board created";
      }

      game.state.svg = d3.select(options.svg_container).append("svg")
                         .attr("id", "game")
                         .attr("opacity", 0)
                         .attr("width", 0)
                         .attr("height", 0);
      game.state.board = game.state.svg.append("g").attr("id", "board");
      game.state.board.selectAll("g")
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
                      .attr("x", function(d, i) {return (i % 8)*(options.dimension/8);})
                      .attr("y", function(d, i, j) {return j*(options.dimension/8);})
                      .attr("width", options.dimension/8)
                      .attr("height", options.dimension/8)
                      .attr("class", function(d) {return (d == 1) ? ("dark") : ("light");});

      //animations to show the board
      if (options.fold){
        game.state.svg.transition().duration(options.duration/3)
                      .style("opacity", 1)
                      .attr("width", options.dimension/2)
                      .attr("height", options.dimension/2);
        game.state.svg.transition().duration(options.duration/3).delay(options.duration/3)
                      .attr("height", options.dimension);
        game.state.svg.transition().duration(options.duration/3).delay(2*options.duration/3)
                      .attr("width", options.dimension);
      } else {
        game.state.svg.transition().duration(options.duration)
                      .style("opacity", 1)
                      .attr("width", options.dimension)
                      .attr("height", options.dimension);
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
        if (game.state.boardOptions == undefined){
          options.duration = 2000;
          options.fold = true;
          options.text = false;
        } else {
          options = game.state.boardOptions;
        }
      } else {
        if (options.duration == undefined) options.duration = 2000; // 2 seconds
        if (options.fold != false) options.fold = true;
        if (options.text != true) options.text = false;
      }
      
      if (options.text){
        game.state.board.remove();
        game.state.board = {};
        game.state.svg = {};

        return "text board removed";
      }

      var width = game.state.svg.attr("width");

      if (options.fold) {
        game.state.svg.transition().duration(options.duration/3)
                      .attr("width", width/2);
        game.state.svg.transition().duration(options.duration/3).delay(options.duration/3)
                      .attr("height", width/2);
        game.state.svg.transition().duration(options.duration/3).delay(2*options.duration/3)
                      .style("opacity", 0)
                      .attr("width", 0)
                      .attr("height", 0)
                      .remove();
      } else {
        game.state.svg.transition().duration(options.duration)
                      .style("opacity", 0)
                      .attr("width", 0)
                      .attr("height", 0)
                      .remove();
      }
      game.state.board = {};
      game.state.svg = {};

      return "board removed";
    }
  },
  state: {
    isBoardCreated: function(){
      return d3.select("#game").node() != null;
    },
    boardIsText: function(){
      return !Array.isArray(game.state.svg);
    },
    svg: {},
    board: {},
    // boardOptions is not initialized, because 'undefined' has meaning.
    piecePath: "./images/pieces/"
  }
};

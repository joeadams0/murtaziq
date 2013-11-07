define(["text!templates/match/match.ejs",
        "text!templates/match/state.ejs"
  ], function(matchTemplate, stateTemplate) {

  var match = {};

/************************************************************************************
 * The Model
 * **********************************************************************************/

  var modelFunctions = {};

  modelFunctions.initialize = function() {
    this.cache = {};
    this.cache.users = {};
  };

  modelFunctions.getUser = function(id, cb) {
    var self = this;
    if(id <= 0)
      cb(undefined);
    if(this.cache.users[id])
      cb(this.cache.users[id]);
    else{
      mapi.getUser(id, function(user) {
        self.cache.users[id] = user;
        cb(user);
      });
    }
  };

  modelFunctions.removeHighlights = function() {
    this.cache.possibleMoves = undefined;
    _.each(match.state.model.match.board, function(row) {
      _.each(row, function(space) {
        space.highlight = undefined;
      });
    });
  };

  modelFunctions.getSpace = function(x, y) {
    if(!this.get('match').board)
      return undefined;
    else
      return this.get('match').board[y][x];
  };



  var MatchModel = Backbone.Model.extend(modelFunctions);

/************************************************************************************************/



/********************************************************************************************
* View
* *****************************************************************************************/
  var viewFuns = {};

  viewFuns.initialize = function() {    
    var self = this;

    this.matchTemplate = matchTemplate;
    this.stateTemplate = stateTemplate;

    this.piecePath = "./images/pieces/";

    this.model.getUser(this.model.get("lightPlayer"), function(lightPlayer) {
      self.model.getUser(self.model.get("darkPlayer"),function(darkPlayer) {
        // Add the HTML Structure
        self.$el = $(new EJS({text : matchTemplate}).render({
          lightPlayer : lightPlayer,
          darkPlayer : darkPlayer
        }));

        self.$el.appendTo("#"+game.config.container);
        self.$state = $("#match #state");

        // parse options
        if (self.model.get('boardOptions') == undefined){
          options = {};
          options.svg_container = "board-container";
          options.dimension = 720;
          options.duration = 2000;
          options.fold = true;
          options.text = false;
          options.moveHighlightColor = "green"; 

        } else {
          if (options.svg_container == undefined) options.svg_container = "board-container";
          if (options.dimension == undefined) options.dimension = 720;
          if (options.duration == undefined) options.duration = 2000; // 2 seconds
          if (options.fold != false) options.fold = true;
          if (options.text != true) options.text = false;
        }

        // save the options we used so we can use the same ones to end
        self.model.set('boardOptions', options);

        if (self.isBoardCreated()) {
          d3.select('#board').remove();
        }

        if (options.text){
          self.svg = {};
          self.board = d3.select(options.svg_container)
                               .append("table")
                               .attr("id", "board");
        }

        self.svg = d3.select(options.svg_container).append("svg")
                           .attr("id", "view")
                           .attr("opacity", 0)
                           .attr("width", 0)
                           .attr("height", 0);

        self.board = self.svg.append("g").attr("id", "board");
        self.board.selectAll("g")
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
                        })
                        .attr("x", function(d, i) {return (i % 8)*(options.dimension/8);})
                        .attr("y", function(d, i, j) {return j*(options.dimension/8);})
                        .attr("width", options.dimension/8)
                        .attr("height", options.dimension/8)
                        .attr("class", function(d) {return (d == 1) ? ("dark") : ("light");})
                        .attr("tile-color", function(d) {return (d == 1) ? ("dark") : ("light");});

        //animations to show the board
        if (options.fold){
          self.svg.transition().duration(options.duration/3)
                        .style("opacity", 1)
                        .attr("width", options.dimension/2)
                        .attr("height", options.dimension/2);
          self.svg.transition().duration(options.duration/3).delay(options.duration/3)
                        .attr("height", options.dimension);
          self.svg.transition().duration(options.duration/3).delay(2*options.duration/3)
                        .attr("width", options.dimension)
        } else {
          self.svg.transition().duration(options.duration)
                        .style("opacity", 1)
                        .attr("width", options.dimension)
                        .attr("height", options.dimension);
        }



        self.listenTo(self.model, "change", self.render);
        self.render();
      });
    });

  };

  viewFuns.renderMatch = function() {
    var self = this;
    var boardDimension = this.svg.attr("width");

    var matchState = this.model.attributes;

    if (d3.select("#pieces").node() == null) {
      this.pieces = this.svg.append("g").attr("id", "pieces");
      this.piecesRows = this.pieces.selectAll("g");
      this.piecesRows.data(matchState.match.board).enter().append("g").selectAll("image")
                       .data(function(d) {return d;})
                       .enter().append("image")
                       .attr("xlink:href", function(d){ return (d.piece == undefined) ? (""): (self.piecePath + d.piece.name +" "+(d.piece.team + 1)+".png");})
                       .style("opacity", 0) // initially invisible
                       .attr("height", (boardDimension/8)+"px")
                       .attr("pointer-events", "none")
                       .attr("width", (boardDimension/8)+"px")
                       .attr("x", function(d, i) {return (i % 8)*(boardDimension/8);})
                       .attr("y", function(d, i, j) {return j*(boardDimension/8);})
                       .transition().duration(500).style("opacity", 1); // fade in
    } else {
      var imgs = this.pieces.selectAll("g").data(matchState.match.board).selectAll("image").data(function(d) {return d;});

      this.board.selectAll("g")
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
      imgs.attr("xlink:href", function(d){ return (d.piece == undefined) ? (""): (self.piecePath + d.piece.name +" "+(d.piece.team + 1)+".png");})
           .attr("x", function(d, i) {return (i % 8)*(boardDimension/8);})
           .attr("y", function(d, i, j) {return j*(boardDimension/8);})
           .attr("pointer-events", "none");
      // exit the rest
      imgs.exit().remove();
    }
    d3.selectAll("image").select(function(d) {return (d.piece == undefined) ? (this) : null ;}).remove();

    return this;
  };

  viewFuns.renderState = function() {
    this.$state.html(new EJS({text : this.stateTemplate}).render({
      isLightTurn : this.model.get('match').isLightTurn,
      state : this.model.get('match').state == "normal" ? undefined : this.model.get('match').state
    }));
    return this;
  };

  viewFuns.isBoardCreated = function() {
    return d3.select("#board").node() != null;
  };

  viewFuns.render = function() {
    this.renderMatch()
        .renderState();
  };

  viewFuns.unload = function() {
    this.$el.remove();
  };

  var MatchView = Backbone.View.extend(viewFuns);

/*********************************************************************************************************************/

  // Load up the game
  match.load = function(data, cb){
    if(!cb)
      cb = function() {};
    match.model = new MatchModel(data);
    match.view = new MatchView({
      model : match.model
    });
    cb();
  };

  // Remove the game
  match.unload = function() {
    this.view.unload();
  };

  match.drawTextmatch = function(matchState){
    matchState = JSON.parse(matchState);
    if (!self.isBoardCreated() || !self.boardIsText()) {
      match.init.board({text:true});
      self.textRows = self.board.selectAll("tr")
                                .data(matchState)
                                .enter().append("tr");

      var td = self.textRows.selectAll("td")
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
      self.textRows = self.board.selectAll("tr")
                                .data(matchState);

      var td = self.textRows.selectAll("td")
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
    if (self.isBoardCreated() && !self.boardIsText()){
      match.draw.fromBoardState(initialState);
      move = JSON.parse(move);
      var boardDimension = self.svg.attr("width");

      self.pieces.selectAll("image").select(function() {
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
      if (self.boardOptions == undefined){
        options.duration = 2000;
        options.fold = true;
        options.text = false;
      } else {
        options = self.boardOptions;
      }
    } else {
      if (options.duration == undefined) options.duration = 2000; // 2 seconds
      if (options.fold != false) options.fold = true;
      if (options.text != true) options.text = false;
    }
    
    if (options.text){
      self.board.remove();
      self.board = {};
      self.svg = {};

      return "text board removed";
    }

    var width = self.svg.attr("width");

    if (options.fold) {
      self.svg.transition().duration(options.duration/3)
                    .attr("width", width/2);
      self.svg.transition().duration(options.duration/3).delay(options.duration/3)
                    .attr("height", width/2);
      self.svg.transition().duration(options.duration/3).delay(2*options.duration/3)
                    .style("opacity", 0)
                    .attr("width", 0)
                    .attr("height", 0)
                    .remove();
    } else {
      self.svg.transition().duration(options.duration)
                    .style("opacity", 0)
                    .attr("width", 0)
                    .attr("height", 0)
                    .remove();
    }
    self.board = {};
    self.svg = {};

    return "board removed";
  };

  // STATE Tracking Functions

  match.state = {};

  // Contains all things relating to the rendering of the state
  self = {};

  self.isBoardCreated = function(){
    return d3.select("#match").node() != null;
  };

  self.boardIsText = function(){
    return !Array.isArray(self.svg);
  };

  return match;

});

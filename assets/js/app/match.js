define(["text!templates/match/match.ejs",
        "text!templates/match/state.ejs",
        "text!templates/match/matchover.ejs"
  ], function(matchTemplate, stateTemplate, matchOverTemplate) {

  var match = {};

/************************************************************************************
 * The Model
 * **********************************************************************************/

  var modelFunctions = {};

  modelFunctions.initialize = function() {
    this.cache = {};
    this.cache.users = {};
    this.cache.moves = {};
    this.highlights = {
      selected : "selected",
      friendly : "friendly",
      enemy : "enemy",
      neutral : "neutral"
    };

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
    _.each(this.get('match').board, function(row) {
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

  modelFunctions.getMoves = function(loc, cb) {
    var self = this;
    if(this.cache.moves[loc.x] && this.cache.moves[loc.x][loc.y]){
      cb(this.cache.moves[loc.x][loc.y]);
    }
    else
      mapi.getMoves({
        matchId : this.get('id'),
        loc : loc
      }, function(status) {
        if(status.success){
          cb(status.data);
          if(self.cache.moves[loc.x])
            self.cache.moves[loc.x][loc.y] = status.data;
          else{
            self.cache.moves[loc.x] = {};
            self.cache.moves[loc.x][loc.y] = status.data;
          }
        }
        else{
          alert(status.data);
          cb({});
        }
      });
  };

  modelFunctions.locEquality = function(loc1, loc2) {
    return loc1.x == loc2.x && loc1.y == loc2.y;
  };

  modelFunctions.highlightMoves = function(data) {

    this.getSpace(data.loc.x, data.loc.y).highlight = this.highlights.selected;

    _.each(data.moves, function(move) {
      // Friendly moves
      if((move.isLightTeam && game.state.user.id == this.get('lightPlayer'))||
          (!move.isLightTeam && game.state.user.id == this.get('darkPlayer'))){

        this.getSpace(move.target.x, move.target.y).highlight = this.highlights.friendly;
      }
      // Enemy Moves
      else if((move.isLightTeam && game.state.user.id == this.get('darkPlayer'))||
          (!move.isLightTeam && game.state.user.id == this.get('lightPlayer'))){

        this.getSpace(move.target.x, move.target.y).highlight = this.highlights.enemy;
      }
      // Observer Moves
      else{
        this.getSpace(move.target.x, move.target.y).highlight = this.highlights.neutral;
      }
    }, this);
  };

  modelFunctions.attemptMove = function(source, target) {
    var self = this;

    mapi.performMove({
      matchId : this.get('id'),
      playerId : game.state.user.id,
      source : source,
      target : target,
    }, function(status) {
      if(!status.success)
        alert(status.data);
    });
  };

  modelFunctions.clearMoveCache = function() {
    this.cache.moves = [];
  };

  modelFunctions.isMatchOver = function() {
    return this.get("state") == "matchover";
  };

  modelFunctions.isPlaying = function() {
    return this.get("state") == "playing";
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

    this.piecePath = window.location.origin + "/images/pieces/";

    this.model.getUser(this.model.get("lightPlayer"), function(lightPlayer) {
      self.model.getUser(self.model.get("darkPlayer"),function(darkPlayer) {
        var options = self.model.get('boardOptions');
        // Add the HTML Structure
        self.$el = $(new EJS({text : matchTemplate}).render({
          lightPlayer : lightPlayer,
          darkPlayer : darkPlayer
        }));

        self.$el.appendTo("#"+game.config.container);
        self.$state = $("#match #state");



        game.chat.create(self.model.get('playerChat'), $("#match .chat"), $("#match .chat-input"), $("#match .chat-send"));
        $(".chat-form").submit(function() {
          return false;
        });
        mapi.joinChat(self.model.get('playerChat'), function(status) {
          if(!status.success)
            alert(status.data);
        });

        $("#match #options").tooltip({
        'selector': '',
        'placement': 'top'
      });
        
        var defaultOptions = {};
        defaultOptions.svg_container = "#board-container";
        defaultOptions.dimension = 720;
        defaultOptions.duration = 2000;
        defaultOptions.fold = true;
        defaultOptions.text = false;
        defaultOptions.moveHighlightColor = "green"; 
        defaultOptions.boardId = "board";
        defaultOptions.viewId = "view";
        defaultOptions.piecesId = "pieces";
        defaultOptions.darkSpaceClass = "dark";
        defaultOptions.lightSpaceClass = "light";
        defaultOptions.friendlyHighlight = "friendly-highlight";
        defaultOptions.enemyHighlight = "enemy-highlight";
        defaultOptions.neutralHighlight = "neutral-highlight";

        // parse options
        if (options == undefined){
          options = defaultOptions;
          
        } else {
          _.each(defaultOptions, function(value, key) {
            if(!options[key])
              options[key] = value;
          });
        }

        // save the options we used so we can use the same ones to end
        self.model.set('boardOptions', options);

        if (self.isBoardCreated()) {
          d3.select('#'+options.boardId).remove();
        }

        if (options.text){
          self.svg = {};
          self.board = d3.select(options.svg_container)
                               .append("table")
                               .attr("id", options.boardId);
        }

        self.svg = d3.select(options.svg_container).append("svg")
                           .attr("id", options.viewId)
                           .attr("opacity", 0)
                           .attr("width", 0)
                           .attr("height", 0);

        self.board = self.svg.append("g").attr("id", options.boardId);
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
                          match.spaceSelected(space.attr("x")/space.attr("width"), space.attr("y")/space.attr("height"));
                        })
                        .attr("x", function(d, i) {return (i % 8)*(options.dimension/8);})
                        .attr("y", function(d, i, j) {return j*(options.dimension/8);})
                        .attr("width", options.dimension/8)
                        .attr("height", options.dimension/8)
                        .attr("class", function(d) {return (d == 1) ? (options.darkSpaceClass) : (options.lightSpaceClass);})
                        .attr("tile-color", function(d) {return (d == 1) ? (options.darkSpaceClass) : (options.lightSpaceClass);});

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
                        .each("end", function() {
                          self.listenTo(self.model, "change", self.render);
                          self.listenTo(self.model, "change:state", self.matchOver);
                          self.render();
                        });
        } else {
          self.svg.transition().duration(options.duration)
                        .style("opacity", 1)
                        .attr("width", options.dimension)
                        .attr("height", options.dimension)
                        .each("end", function() {
                          self.listenTo(self.model, "change", self.render);
                          self.listenTo(self.model, "change:state", self.matchOver);
                          self.render();
                        });
        }
      });
    });

  };

  viewFuns.renderMatch = function() {
    var self = this;
    var boardDimension = this.svg.attr("width");

    var matchState = this.model.attributes;

    this.board.selectAll("g")
      .data(matchState.match.board)
      .selectAll("rect")
      .data(function(d) { return d})
      .attr("class", function(d) {  
        if(d.piece && d.piece.royalty){
          return "royal";
        }
        if(d.highlight){
         
          switch(d.highlight){
            case self.model.highlights.friendly:
              return matchState.boardOptions.friendlyHighlight;
              break;

            case self.model.highlights.enemy:
              return matchState.boardOptions.enemyHighlight;
              break;

            default:
              return matchState.boardOptions.neutralHighlight;
          }
        }
        else
          return d3.select(this).attr("tile-color");
      });

    if (d3.select("#pieces").node() == null) {
      this.pieces = this.svg.append("g").attr("id", matchState.boardOptions.piecesId);
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
    $("#surrender").on("click", this.surrender);  
  };

  viewFuns.unload = function(cb) {
    this.$el.remove();
    if(cb)
      cb();
  };

  viewFuns.matchOver = function() {
    var victory = undefined;
    if(this.model.get('winner'))
      victory = this.model.get('winner') == game.state.user.id;
    if(this.model.get('match').state == "surrender"){
      if(victory)
        this.displayModal(victory, function() {
          game.switchState("mainmenu");
        }, true);   
    }
    else{
      this.displayModal(victory, function() {
        game.switchState("mainmenu");
      });
    }
  };

  viewFuns.surrender = function() {
    mapi.surrender({
      matchId : match.model.get('id')
    }, function(status) {
      if(status.success)
        game.switchState('mainmenu');
      else
        alert(status.data);
    });
  };

  viewFuns.displayModal = function(victory, buttonListener, surrender) {
    var modal = $("#match .modal");
    modal.html(new EJS({text: matchOverTemplate}).render({
      victory : victory,
      surrender : surrender
    }));

    modal.modal({
      backdrop : "static",
      keyboard : "false"
    });
    $("#match #modal-primary").on("click", function(e) {
      buttonListener(e);
    });
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
  match.unload = function(cb) {
    this.view.unload(cb);
  };

  match.recieveMessage = function(message) {
    if(message.verb = "update"){
      match.model.set(message.data);
      this.model.clearMoveCache();
    }
  };

  match.spaceSelected = function(x,y) {
    var highlightMoves = true;
    var self = this;

    if(this.model.get('selectedLoc')){
      var selectedLoc = this.model.get('selectedLoc');
      // If trying to move
      if(!this.model.locEquality(selectedLoc, {
          x : x,
          y : y
        }) 
        && this.model.isPlaying()){
        this.model.getMoves(selectedLoc, function(data) {
          _.each(data.moves , function(move) {
            if( (this.model.locEquality(selectedLoc, move.source)) && (this.model.locEquality({x: x, y:y}, move.target))){
              this.model.attemptMove(move.source, move.target);
              highlightMoves = false;
            }
          }, self);
        });
      }
      else
        highlightMoves = false;
    }

    if(this.model.get('selectedLoc'))
      this.model.removeHighlights();
    this.model.set({
      selectedLoc : undefined
    });

    
    // If highlight possible moves
    if(highlightMoves && this.model.getSpace(x,y).piece){
      var selectedLoc = {
        x : x,
        y : y
      };
      this.model.set({
        selectedLoc : selectedLoc
      });
      this.model.getMoves(selectedLoc, function(data) {
        self.model.highlightMoves(data);
        self.view.render();
      });
    }
    else{
      this.view.render();
    }
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


  return match;

});

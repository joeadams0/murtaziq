define(["text!templates/pieceSelection.ejs"], function(template){
  var sel = {};
  
  // required load function to be used by the SPA architecture
  sel.load = function( data, cb ){
    // set up the data
    sel.init({
      matchId: data.id,
      playerId: game.state.user.id
    }, function(){  // put this stuff in a callback, so that we can be sure that things are initialized first.
      // render the view
      sel.$template = $(new EJS({text : template}).render({pieceList: sel.pieceVals}));
      sel.$template.appendTo("#" + game.config.container);

      // set up the jQuery DOM manipulators/ listeners
      //   depends on jQuery-ui
      sel.jQuery();

      // call the callback to finish
      cb();
    });
  };

  // required unload function to be used by the SPA architecture
  sel.unload = function( ){
    // get rid of the view (template)
    sel.$template.remove();
  };

  ////////////
  // FIELDS //
  ////////////

  // configuration settings
  sel.cfg = {};

  sel.$template = {};

  sel.cost = 0;

  sel.pieces = {};

  sel.pieceVals = [];

  sel.maxTeamValue = 400;

  ///////////////
  // FUNCTIONS //
  ///////////////
  
  // for changing state
  sel.recieveMessage = function(data){
    console.log(data);
    if (data.state == "playing"){
      game.switchState("match", data);
    }
  };

  // config MUST contain 'matchId' and 'playerId' or this don't work
  sel.init = function(config, cb){
    sel.cfg = _.defaults(config, {
      maxCostId: "#maxCost",
      currentCostId: "#currentCost"
    });

    mapi.getMaxTeamValue(function(val){
      sel.maxTeamValue = val;
      $(sel.cfg.maxCostId).text(""+sel.maxTeamValue);
    });

    mapi.getAllPieces(function(arr){
      sel.pieceVals = arr;
      cb();
    });
  };

  // set mult to -1 to reduce cost and 1 or undefined to increase cost
  sel.updateCost = function(name, pos, mult){
    if(mult == undefined){mult = 1;}
    switch(pos){
      case "royal":
        sel.cost = sel.cost + (mult*(1)*(_.where(sel.pieceVals, {name: name})[0].value));
        break;
      case "queen":
        sel.cost = sel.cost + (mult*(1)*(_.where(sel.pieceVals, {name: name})[0].value));
        break;
      case "rook":
        sel.cost = sel.cost + (mult*(2)*(_.where(sel.pieceVals, {name: name})[0].value));
        break;
      case "knight":
        sel.cost = sel.cost + (mult*(2)*(_.where(sel.pieceVals, {name: name})[0].value));
        break;
      case "bishop":
        sel.cost = sel.cost + (mult*(2)*(_.where(sel.pieceVals, {name: name})[0].value));
        break;
      case "pawn":
      default:
        sel.cost = sel.cost + (mult*(8)*(_.where(sel.pieceVals, {name: name})[0].value));
        break;
    }

    $(sel.cfg.currentCostId).text(""+sel.cost);
  };

  sel.setTeam = function(){
    if (sel.cost > sel.maxTeamValue)
      alert("nope. Army too big, buddy.");
    else
      mapi.setPieces({
        matchId: sel.cfg.matchId,
        playerId: sel.cfg.playerId,
        pieces: sel.pieces
      }, function(res){console.log(res);});
  };

  sel.jQuery = function(){
    // on DOM ready shortcut.
    $(function() {
      // PAGE-dependant VARIABLES
      // all class/ids MUST include selector (./#)
      var cfg = {}, act = {};
      cfg.pieceContainerClass = ".piece";
      cfg.pieceListClass = ".pieceList";
      cfg.boardSpotClass = ".spot";
      cfg.pieceInfoClass = ".pieceInfo";
      cfg.teamListClass = ".myTeamView";
      cfg.connectorClass = ".connector";
      cfg.submitId = "#setAsTeam";
      // variables for internal use
      cfg.enterTimer = 0;
      cfg.info = {};
      cfg.info.removeInfoBlock = function(e){
        var $info = $(e.currentTarget).find(cfg.pieceInfoClass); // the div to display information
        $info.fadeOut(250);
      };
      cfg.info.dragging = false;

      // set up listeners
      act.listenToSubmit = function(){
        $( cfg.submitId ).click(function(e){
          sel.setTeam();
        });
      };
      // DISPLAY PIECE INFO
      act.handleShowingInfo = function(){ 
        // Start dragging
        $(cfg.pieceContainerClass).mousedown(function(e){
          cfg.info.dragging = true;
          cfg.info.removeInfoBlock(e);
          // bind the up-listener
          $(cfg.pieceContainerClass).mouseup(function(e){
            cfg.info.dragging = false;
          });
        });
        // show the info-block
        $(cfg.pieceContainerClass).mouseenter(function(e){
          cfg.enterTimer = new Date().getTime();
        });
        $(cfg.pieceContainerClass).mousemove(function(e){
          if(cfg.info.dragging){return;}
          var $info = $(e.currentTarget).find(cfg.pieceInfoClass); // the div to display information
          if($info.data("stuck") != "true"){
            if (new Date().getTime() - cfg.enterTimer > 500)
              $info.css({
                     top: e.pageY,
                     left: e.pageX,
                     position: "fixed"
                   })
                   .fadeIn(250);
          }
        });
        // hide the info-block
        $(cfg.pieceContainerClass).mouseleave(cfg.info.removeInfoBlock);
        // Freeze the info-block on mouse entering it.
        $(cfg.pieceInfoClass).mouseenter(function(e){
          $(this).data("stuck","true");
        });
        // un-freeze the info-block
        $(cfg.pieceInfoClass).mouseleave(function(e){
          $(this).removeData("stuck");
        });
      };
      
      // DRAGGING PIECES
      act.allowDragging = function(){
        // initialize the jQuery-ui draggability functions
        $( cfg.pieceContainerClass ).draggable({
          snap: "" + cfg.boardSpotClass + ", .pieceList",
          snapMode: "inner"
        });
      };

      //convinience method
      act.things = function(){
        act.handleShowingInfo();
        act.allowDragging();
      };


      // DROPPING PIECES on either the board or the unit list
      act.allowDropping = function(){
        // listen for user dropping piece on board.
        $( cfg.boardSpotClass ).droppable({
          drop: function ( e, ui ){
            // VARIABLES
            var $me = $(this),
                pos = $me.data("pos"),
                $him = ui.draggable,
                name = $him.data("name");

            if ($me.find("*").length > 0 ){return;}

            // Make the document look right
            $("*[data-name="+name+"]").remove();
            $("*[data-pos="+pos+"]").append($him);
            $("*[data-name="+name+"]").removeClass("ui-draggable-dragging");
            $("*[data-name="+name+"]").attr("style", "");

            // Enable showingInfo and dragging
            act.things();
            
            // bugfix
            $( cfg.pieceInfoClass ).hide();

            // DATA MANIPULATOR
            sel.pieces[pos] = name;
            sel.updateCost(name, pos);

            // remove the piece from it's old spot in the army
            _.each( sel.pieces, function( val, key, list){
              if ( val == name && key != pos){
                sel.updateCost(val, key, -1);
                sel.pieces[key] = undefined;
              }
            });
          }
        });
        // listen for user dropping piece on piece list.
        $( cfg.pieceListClass ).droppable({
          drop: function ( e, ui ){
            var $me = $(this);
            var $him = ui.draggable;
            var name = $him.data("name");
            $("*[data-name="+name+"]").remove();

            $me.append($him);
            $("*[data-name="+name+"]").removeClass("ui-draggable-dragging");
            $("*[data-name="+name+"]").attr("style", "");

            act.things();
            
            $( cfg.pieceInfoClass ).hide();
            
            // remove the piece from it's old spot in the army
            _.each( sel.pieces, function( val, key, list){
              if ( val == name){
                sel.updateCost(val, key, -1);
                sel.pieces[key] = undefined;
              }
            });
          }
        });
      };


      // Actually do things
      act.listenToSubmit();
      act.things();
      act.allowDropping();
    });
  };

  return sel;
});

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
    $(cfg.pieceContainerClass).mousemove(function(e){
      if(cfg.info.dragging){return;}
      var $info = $(e.currentTarget).find(cfg.pieceInfoClass); // the div to display information
      if($info.data("stuck") != "true"){
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


// ABSTRACT LOGIC FOR PIECE SELECTION
window.sel = {};

sel.cfg = {};

sel.initialized = false;
// config MUST contain 'matchId' and 'playerId' or this don't work
sel.init = function(config){
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
  });

  sel.initialized = true;
};

sel.cost = 0;

sel.pieces = {};

// set mult to -1 to reduce cost and 1 or undefined to increase cost
sel.updateCost = function(name, pos, mult){
  if(mult == undefined){mult = 1;}
  switch(pos){
    case "king-spot":
      sel.cost = sel.cost + (mult*(1)*(_.where(sel.pieceVals, {name: name})[0].value));
      break;
    case "queen-spot":
      sel.cost = sel.cost + (mult*(1)*(_.where(sel.pieceVals, {name: name})[0].value));
      break;
    case "rook-spot":
      sel.cost = sel.cost + (mult*(2)*(_.where(sel.pieceVals, {name: name})[0].value));
      break;
    case "knight-spot":
      sel.cost = sel.cost + (mult*(2)*(_.where(sel.pieceVals, {name: name})[0].value));
      break;
    case "bishop-spot":
      sel.cost = sel.cost + (mult*(2)*(_.where(sel.pieceVals, {name: name})[0].value));
      break;
    case "pawn-spot":
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

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
  // variables for internal use
  cfg.info = {};
  cfg.info.removeInfoBlock = function(e){
    var $info = $(e.currentTarget).find(cfg.pieceInfoClass); // the div to display information
    $info.fadeOut(250);
  };
  cfg.info.dragging = false;

  // set up listeners
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

        // remove the piece from it's old spot in the army
        _.each( sel.pieces, function( val, key, list){
          if ( val == name && key != pos)
            sel.pieces[key] = undefined;
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
          if ( val == name)
            sel.pieces[key] = undefined;
        });
      }
    });
  };


  // Actually do things
  act.things();
  act.allowDropping();
});


// ABSTRACT LOGIC FOR PIECE SELECTION
window.sel = {};

sel.initialized = false;
sel.init = function(){
  mapi.getMaxTeamValue(function(val){
    sel.maxTeamValue = val;
  });

  sel.initialized = true;
};

sel.pieces = {};

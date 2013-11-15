define([
	"text!templates/lobby/lobby.ejs", 
	"text!templates/lobby/player-row.ejs", 
	"text!templates/lobby/optionsmenu.ejs"
	], 
	
	function(maintemp, pRowTemplate, optionsMenuTemplate) {
	var lobby = {};


	lobby.state = {};
	lobby.state.users = {};

	var LobbyModel = Backbone.Model.extend({

		initialize : function() {
			this.bind("change:state", lobby.loadPieceSelection);
			this.cache = {};
			this.cache.users = {};

			mapi.joinChat(this.get('lobbyChat'), function(status) {
				if(!status.success)
					alert(status.data);
			});
		},

		getUser : function(id, cb) {
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
		},

	});

	var LobbyView = Backbone.View.extend({
		initialize : function() {
			
			this.listenTo(this.model, "change", this.render);

			this.maintemp = maintemp;
			this.pRowTemplate = pRowTemplate;
			this.optionsMenuTemplate = optionsMenuTemplate;

			this.$el = $(new EJS({text : maintemp}).render({}));
			this.$el.appendTo("#"+game.config.container);

			this.$playerRow = $("#player-row");
			this.$hostEl = $("#lobby-host-wrap");
			this.$startButtonEl = $("#lobby-start-button-wrap");
			this.$optionsMenu = $("#lobby #options-menu");

			$("#lobby #options, #lobby #switch-sides").tooltip({
			  'selector': '',
			  'placement': 'top'
			});
			 
			game.chat.create(this.model.get('lobbyChat'), $("#lobby .chat"), $("#lobby .chat-input"), $("#lobby .chat-send"));

			$("#lobby .chat-form").submit(function() {
				return false;
			});

			this.render();


		},
		
		events: {
		    "click #lobby-start-button" : "startGame",
		    "click #switch-sides" : "switchSides",
		    "click #lobby-disband-match" : "disbandMatch",
		    "click #lobby-leave-match" : "leaveMatch"
		},

		startGame : function() {

			$("#lobby-start-button").button('loading');			
			mapi.startMatch({
				id : this.model.get('id')
			}, function(status) {

				$("#lobby-start-button").button('reset');
				if(!status.success)
					alert(status.data);
			});
		},

		switchSides : function() {
			$("#lobby #switch-sides").button('loading');
			mapi.setPlayer({
				matchId : this.model.get('id'),
				playerId : game.state.user.id,
				isLightSide : game.state.user.id != this.model.get('lightPlayer')
			},
			function(status) {
				$("#lobby #switch-sides").button('reset');
				if(!status.success)
					alert(status.data);
			});
		},

		disbandMatch : function(cb) {
			mapi.disbandMatch({
				matchId : this.model.get('id')
			}, function(status) {
				if(!status.success)
					alert(status.data);
				else if(cb)
					cb();
			});
		},

		leaveMatch : function(cb) {
			mapi.removePlayer({
				matchId : this.model.get('id')
			}, function(status) {
				if(!status.success)
					alert(status.data);
				else{
					if(cb)
						cb()
					else
						game.switchState("mainmenu");
				}
			});
		},

		renderPlayerRow : function() {
			var self = this;
			this.model.getUser(this.model.get('lightPlayer'), function(lightPlayer) {
				self.model.getUser(self.model.get('darkPlayer'), function(darkPlayer) {
					self.$playerRow.html(new EJS({text : self.pRowTemplate}).render({
						lightPlayer : lightPlayer,
						darkPlayer : darkPlayer
					}));
				});
			});
			return this;
		},

		renderHost : function() {
			var self = this;
			this.model.getUser(this.model.get('host'), function(player) {
				self.$hostEl.html(new EJS({text : self.playertemp}).render({
					title : "Host : ",
					player : player,
					image : undefined
				}));
			});
			return this;
		},

		renderObservers : function() {
			return this;
		},

		renderHostFeatures : function() {

			this.$optionsMenu.html(new EJS({text : this.optionsMenuTemplate}).render({
				isHost : this.model.get('host') == game.state.user.id,
			}));

			if(this.model.get('host') !== game.state.user.id)
				$(".host-feature").hide();
			else{
				$(".host-feature").show();
				if(this.model.get('lightPlayer')<0 || this.model.get('darkPlayer')<0)
					$("#lobby-start-button").prop('disabled', true);
				else
					$("#lobby-start-button").removeAttr('disabled');
			}

			return this;
		},

		render : function() {
			this
				.renderPlayerRow()
				.renderHost()
				.renderObservers()
				.renderHostFeatures();
		},
	});

	lobby.load = function(data, cb) {
		lobby.model = new LobbyModel(data); 
		lobby.view = new LobbyView({model : lobby.model});
		cb();
	};

	lobby.loadPieceSelection = function() {		
		game.switchState("pieceSelection", lobby.model.attributes);
	};

	lobby.unload = function() {
		lobby.view.$el.remove();
		game.chat.leave(this.model.get("lobbyChat"));
	};

	lobby.recieveMessage = function(message) {
		if(message.verb == "update"){
			if(message.data.lightPlayer != game.state.user.id &&
				message.data.darkPlayer != game.state.user.id &&
				!_.contains(message.data.observers, game.state.user.id))
				game.switchState('mainmenu', "You were removed from the match.");
			else
				lobby.model.set(message.data);
		}
		if(message.verb == "destroy")
			game.switchState('mainmenu', "The game was disbanded.");
	};

	lobby.unloadPage = function(cb) {
		if(this.model.get('host') == game.state.user.id)
			this.view.disbandMatch(function() {
				cb();
			});
		else
			this.view.leaveMatch(function() {
				cb();
			});
	};

	return lobby;
});
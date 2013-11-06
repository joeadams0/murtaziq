define(["text!templates/lobby/lobby.ejs", 
	"text!templates/lobby/player-row.ejs", 
	"text!templates/lobby/lobby-start-button.ejs"], 
	
	function(maintemp, pRowTemplate, startbuttontemp) {
	var lobby = {};


	lobby.state = {};
	lobby.state.users = {};

	var LobbyModel = Backbone.Model.extend({

		initialize : function() {
			this.bind("change:state", lobby.loadPieceSelection);
			this.cache = {};
			this.cache.users = {};
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
			this.startbuttontemp = startbuttontemp;

			this.$el = $(new EJS({text : maintemp}).render({}));
			this.$el.appendTo("#"+game.config.container);

			this.$playerRow = $("#player-row");
			this.$hostEl = $("#lobby-host-wrap");
			this.$startButtonEl = $("#lobby-start-button-wrap");
			this.render();


		},
		
		events: {
		    "click #lobby-start-button" : "startGame",
		    "click #switch-sides" : "switchSides",
		},

		startGame : function() {
			$("#lobby-start-button").attr('disabled', 'disabled');			
			mapi.startMatch({
				id : this.model.get('id')
			}, function(status) {
				if(!status.success)
					alert(status.data);
			});
		},

		switchSides : function() {
			$("#switch-sides").attr('disabled', 'disabled');
			mapi.setPlayer({
				matchId : this.model.get('id'),
				playerId : game.state.user.id,
				isLightSide : game.state.user.id != this.model.get('lightPlayer')
			},
			function(status) {
				if(!status.success)
					alert(status.data);
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
			if(this.model.get('host') !== game.state.user.id)
				$(".host-feature").hide();
			else{
				$(".host-feature").show();
				$(".host-feature").removeAttr("disabled");
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
		lobby.view.$el.hide();
	};

	lobby.recieveMessage = function(message) {
		lobby.model.set(message.data);
	};

	return lobby;
});
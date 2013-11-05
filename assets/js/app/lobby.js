define(["text!templates/lobby/lobby.ejs", 
	"text!templates/lobby/player.ejs", 
	"text!templates/lobby/lobby-start-button.ejs"], 
	
	function(maintemp, playertemp, startbuttontemp) {
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
			this.playertemp = playertemp;
			this.startbuttontemp = startbuttontemp;

			this.$el = $(new EJS({text : maintemp}).render({}));
			this.$el.appendTo("#"+game.config.container);

			this.$lightPlayerEl = $("#lobby-light-player-wrap");
			this.$darkPlayerEl = $("#lobby-dark-player-wrap");
			this.$hostEl = $("#lobby-host-wrap");
			this.$startButtonEl = $("#lobby-start-button-wrap");
			this.render();


		},
		
		events: {
		    "click #lobby-start-button" : "startGame",
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

		renderLightPlayer : function() {
			var self = this;
			this.model.getUser(this.model.get('lightPlayer'), function(player) {
				self.$lightPlayerEl.html(new EJS({text : self.playertemp}).render({
					title: "Light Player", 
					player : player,
					image : "images/pieces/pawn 1.png"
				}));
			})
			return this;
		},

		renderDarkPlayer : function() {
			var self = this;
			this.model.getUser(this.model.get('darkPlayer'), function(player) {
				self.$darkPlayerEl.html(new EJS({text : self.playertemp}).render({
					title : "Dark Player",
					player : player,
					image : "images/pieces/pawn 2.png"
				}));
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

		renderStartButton : function() {
			var $el = $(new EJS({text:this.startbuttontemp}).render({
				dispButton : this.model.get('host') === game.state.user.id,
			}));

			if(this.model.get('lightPlayer') < 0 || this.model.get('darkPlayer') < 0)
				$el.attr("disabled", "disabled");

			if(this.model.get('host') === game.state.user.id)
				this.$startButtonEl.html($el[0].outerHTML);
			else
				this.$startButtonEl.html("");

			return this;
		},

		render : function() {
			this
				.renderLightPlayer()
				.renderDarkPlayer()
				.renderHost()
				.renderObservers()
				.renderStartButton();
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
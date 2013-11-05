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
			this.$lightPlayerEl.html(new EJS({text : this.playertemp}).render({
				title: "Light Player: ", 
				player : this.model.get('lightPlayer')
			}));
			return this;
		},

		renderDarkPlayer : function() {
			this.$darkPlayerEl.html(new EJS({text : this.playertemp}).render({
				title : "Dark Player: ",
				player : this.model.get('darkPlayer')
			}));
			return this;
		},

		renderHost : function() {
			this.$hostEl.html(new EJS({text : this.playertemp}).render({
				title : "Host : ",
				player :this.model.get('host')
			}));
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
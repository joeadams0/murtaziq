define(["text!templates/lobby/lobby.ejs", "text!templates/lobby/player.ejs"], function(maintemp, playertemp) {
	var lobby = {};


	lobby.state = {};
	lobby.state.users = {};

	var LobbyModel = Backbone.Model.extend({

		initialize : function() {
		},

	});

	var LobbyView = Backbone.View.extend({
		initialize : function() {
			this.maintemp = maintemp;
			this.playertemp = playertemp;

			this.$el = $(new EJS({text : maintemp}).render({}));
			this.$el.appendTo("#"+game.config.container);

			this.$lightPlayerEl = $("#lobby-light-player-wrap");
			this.$darkPlayerEl = $("#lobby-dark-player-wrap");
			this.$hostEl = $("#lobby-host-wrap");
			this.render();
		},

		renderLightPlayer : function() {
			this.$lightPlayerEl.html(new EJS({text : this.playertemp}).render({player : this.model.get('lightPlayer')}));
			return this;
		},

		renderDarkPlayer : function() {
			this.$darkPlayerEl.html(new EJS({text : this.playertemp}).render({player : this.model.get('darkPlayer')}));
			return this;
		},

		renderHost : function() {
			this.$hostEl.html(new EJS({text : this.playertemp}).render({player :this.model.get('host')}));
			return this;
		},

		renderObservers : function() {
			return this;
		},

		render : function() {
			this
				.renderLightPlayer()
				.renderDarkPlayer()
				.renderHost()
				.renderObservers();
		},
	});

	lobby.load = function(data, cb) {
		lobby.model = new LobbyModel(data); 
		lobby.view = new LobbyView({model : lobby.model});

		cb();
	};

	lobby.unload = function() {
		lobby.state.$el.hide();
	};

	return lobby;
});
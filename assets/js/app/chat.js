
define([
		"text!templates/chat/chatmessage.ejs",
		"text!templates/chat/chatjoin.ejs",
		"text!templates/chat/chatleave.ejs"
	], 
	function(ChatMessageTemplate, ChatJoinTemplate, ChatLeaveTemplate) {

		var chatObj = {};

		var Chat = function(id, $el, $input, $button) {
			this.id = id;
			this.$el = $el;
			this.$input = $input;
			this.$button = $button;
			var self = this;

			this.send = function() {
				var string = $input.val();
				if(_.size(string) != 0){
					mapi.postChat(id, string, function(status) {
						if(!status.success)
							alert(status.data);
					});
					$input.val("");
				}
			};

			this.addMessage = function(username, message){
				var html = new EJS({text : ChatMessageTemplate}).render({
					username : username,
					message : message
				});
				this.addHtml(html);
			};

			this.memberJoined = function(username) {
				var html = new EJS({text : ChatJoinTemplate}).render({
					username : username
				});

				this.addHtml(html);
			};

			this.memberLeft = function(username) {
				var html = new EJS({text : ChatLeaveTemplate}).render({
					username : username
				});	

				this.addHtml(html);		
			};

			this.addHtml = function(html) {
				this.$el.append(html);
				$el.scrollTop($el[0].scrollHeight);
			};


			this.$input.keypress(function(event) {
				if(event.keyCode != 13)
					return
				self.send();
			});

			this.$button.click(function() {
				this.blur();
				self.send();
			});
		};


		/**
		 * Creates a new Chat
		 * @param  {Integer} id The Id of the chat
		 */
		chatObj.create = function(id, $el, $input, $button) {
			var chat = new Chat(id, $el, $input, $button);
			game.chats[id] = chat;
			return chat;
		};

		/**
		 * Removes the chat
		 * @param  {Integer} id The id of the chat
		 */
		chatObj.leave = function(id) {
			mapi.leaveChat(id, function(status) {
				if(status.success)
					delete game.chats[id];
			});
		};

		/**
		 * Recieves a message from the server
		 * @param  {Object} data Data
		 */
		chatObj.recieveMessage = function(data) {
			if(game.chats[data.id]){
				if(data.event == "post")
					game.chats[data.id].addMessage(data.message.username, data.message.message);
				else if(data.event == "join")
					game.chats[data.id].memberJoined(data.message);
				else if(data.event == "leave")
					game.chats[data.id].memberLeft(data.message);
			}
		};

		return chatObj;
	}
);	
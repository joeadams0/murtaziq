require([], main);

function main(){
	var socket = io.connect('http://localhost:1337');
	addListeners(socket);
	socket.request('/user/user', {}, function(user){
		console.log(user);
	});
}

function addListeners(socket){

}
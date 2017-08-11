var	friendFlags		= require('./friendFlags.js');

var	client	= null,
	loaded	= false,
	queue	= [];

module.exports.start = function(c){
	client = c;
}

module.exports.onFullyLoaded = function(){
	if(loaded) return;
	if(queue.length > 0)
		setTimeout(broadcastQueue, 1000);
	loaded = true;
}

function broadcastQueue(){
	for(var msg in queue)
		send(msg.flags, msg.message);
}

function send(flags, message){
	if(!loaded){
		queue.push({flags: flags, message: message});
		return;
	}
	var count = 0;
	Object.keys(client.myNicknames).forEach(function(steamid){
		if(client.myNicknames[steamid] & flags){
			client.chatMessage(steamid, message);
			count++;
		}
	});
	return count;
}

module.exports.send = send;
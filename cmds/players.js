var	EAccessLevel	= require('../enums/EAccessLevel.js'),
	ECommandResult	= require('../enums/ECommandResult.js');

module.exports.accessLevel	= EAccessLevel.Everyone;
module.exports.names		= ["players", "p"];
module.exports.description	= "List players on requested server.";


//----------[ Declarations ]----------//

var	SourceQuery	= require('sourcequery'),
	sq			= new SourceQuery(1000),
	servers		= require('../config.js').servers;

var callId = -1;


//----------[ Exec ]----------//

module.exports.exec = function(data){
	servers
	if(callId != -1){
		data.client.chatMessage(data.steamID, "Currently fetching data, please wait.");
		return ECommandResult.Handled;
	}
	if(data.args.length < 2){
		data.client.chatMessage(data.steamID, "Server not specified, usage: !players <server>.");
		return ECommandResult.Handled;
	}
	callId = getServer(data.args[1]);
	if(callId == -1){
		data.client.chatMessage(data.steamID, "Unknown server specifier, please use 10x or snow.");
		return ECommandResult.Handled;
	}
	sq.open(servers[callId].ip, servers[callId].port);
	
	sq.getPlayers(function(err, players){
		if(!players){
			data.client.chatMessage(data.steamID, "Could not fetch players of " + servers[callId].name + ". Server could be down.");
			callId = -1;
			return ECommandResult.Handled;
		}
		var response = players.length + " player(s) on " + servers[callId].name;
		if(data.args.length > 2 && data.args[2][0] == "f"){
			response += ":";
			for(var i = 0; i < players.length; i++)
				response += "\n• " + players[i].name + " — " + formatSeconds(players[i].online.toFixed(0));
		}
		data.client.chatMessage(data.steamID, response);
		callId = -1;
		sq.close();
	});
	return ECommandResult.Handled;
}


//----------[ Other ]----------//

function formatSeconds(t){
	var	s = t%60,
		m = (t/60).toFixed(0),
		h = (m/60).toFixed(0);
		m = m%60;
	if(h > 0)
		return h + "h " + m + "m " + s + "s";
	else if(m > 0)
		return m + "m " + s + "s";
	return s + "s";
}

function getServer(req){
	req = req.trim().toLowerCase();
	for(var i = 0; i < servers.length; i++)
		for(var j = 0; j < servers[i].calls.length; j++)
			if(servers[i].calls[j] == req)
				return i;
	return -1;
}
var	EAccessLevel	= require('../enums/EAccessLevel.js'),
	ECommandResult	= require('../enums/ECommandResult.js');

module.exports.accessLevel	= EAccessLevel.HeadAdmin;
module.exports.names		= ["rcon", "r", "remote", "cmd", "command"];
module.exports.description	= "Execute an rcon command. (use with caution)";


//----------[ Exec ]----------//

module.exports.exec = function(data){
	if(data.args.length < 3){
		data.client.chatMessage(data.steamID, "Usage: !rcon <server> <command>");
		return ECommandResult.Handled;
	}
	var command = "";
	for(var i = 2; i < data.args.length; i++)
		command += data.args[i] + " ";
	if(!data.net.send(data.args[1], command, function(message){
		data.client.chatMessage(data.steamID, message);
	}))
		data.client.chatMessage(data.steamID, "Invalid server specifier or server offline.");
	return ECommandResult.Handled;
}
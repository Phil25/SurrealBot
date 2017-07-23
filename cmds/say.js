var	EAccessLevel	= require('../enums/EAccessLevel.js'),
	ECommandResult	= require('../enums/ECommandResult.js');

module.exports.accessLevel	= EAccessLevel.Admin;
module.exports.names		= ["say", "s", "sayto"];
module.exports.description	= "Say something as Sophie.";


//----------[ Exec ]----------//

module.exports.exec = function(data){
	if(data.args.length < 3){
		data.client.chatMessage(data.steamID, "Usage: !say <server> <message>");
		return;
	}
	var command = "";
	for(var i = 2; i < data.args.length; i++)
		command += data.args[i] + " ";
	command = command.replace(";", "");
	data.net.send(data.args[1], "bot_say " + command);
	return ECommandResult.OK;
}
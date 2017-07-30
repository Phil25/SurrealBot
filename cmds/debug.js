var	EAccessLevel	= require('../enums/EAccessLevel.js'),
	ECommandResult	= require('../enums/ECommandResult.js');

module.exports.accessLevel	= EAccessLevel.HeadAdmin;
module.exports.names		= ["debug", "d"];
module.exports.description	= "Debug command.";


//----------[ Exec ]----------//

module.exports.exec = function(data){
	if(data.args.length < 2){
		data.client.chatMessage(data.steamID, "Usage: " + data.args[0] + " <command>");
		return ECommandResult.Handled;
	}
	switch(data.args[1]){
		case 'flags':
			console.log(data.client.myNicknames);
			data.client.chatMessage(data.steamID, "Friend flags printed to console.");
			break;
	}
	return ECommandResult.Handled;
}
var	EAccessLevel	= require('../enums/EAccessLevel.js'),
	ECommandResult	= require('../enums/ECommandResult.js');

module.exports.accessLevel	= EAccessLevel.HeadAdmin;
module.exports.names		= ["wipe", "clearfriends"];


//----------[ Exec ]----------//

module.exports.exec = function(data){
	data.client.chatMessage(data.steamID, "Command not implemented, grab Phil!");
	return ECommandResult.OK;
}
var	EAccessLevel	= require('../enums/EAccessLevel.js'),
	ECommandResult	= require('../enums/ECommandResult.js');

module.exports.accessLevel	= EAccessLevel.Everyone;
module.exports.names		= ["help", "h", "commands", "cmds", "command", "cmd"];


//----------[ Declarations ]----------//

const fs = require('fs');
var help = "List of available commands:";
fs.readdirSync('./cmds/').forEach(file => {
	if(file != "cmdproc.js")
		help += "\n!" + file.substring(0, file.toString().length -3);
});


//----------[ Exec ]----------//

module.exports.exec = function(data){
	data.client.chatMessage(data.steamID, help);
	return ECommandResult.OK;
}
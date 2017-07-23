var	EAccessLevel	= require('../enums/EAccessLevel.js'),
	ECommandResult	= require('../enums/ECommandResult.js');

module.exports.accessLevel	= EAccessLevel.Everyone;
module.exports.names		= ["help", "h", "commands", "cmds", "command", "cmd"];
module.exports.description	= "List accessible commands.";

//----------[ Declarations ]----------//

const fs = require('fs');
var	cmds = [], cmdCount = 0;
fs.readdirSync('./cmds/').forEach(file => {
	if(file != "cmdproc.js")
		cmds[cmdCount++] = require('./' + file);
});
var ac = require('../lib/accessCheck.js');


//----------[ Exec ]----------//

module.exports.exec = function(data){
	var help = "", count = 0;
	for(var i = 0; i < cmdCount; i++)
		if(ac.hasAccess(data.steamID.accountid, cmds[i].accessLevel)){
			help += "\n    !" + cmds[i].names[0] + " — " + cmds[i].description;
			count++;
		}
	help = count + " accessible commands:" + help;
	data.client.chatMessage(data.steamID, help);
	return ECommandResult.OK;
}
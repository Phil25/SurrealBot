const	fs				= require('fs');
var		ac				= require('./accessCheck.js');
var	cmds = [], cmdCount = 0,
	EAccessLevel	= require('../enums/EAccessLevel.js'),
	ECommandResult	= require('../enums/ECommandResult.js');
fs.readdirSync('./cmds/').forEach(file => cmds[cmdCount++] = require('../cmds/' + file));
console.log("Registered " + cmdCount + " command(s).");

function getArgs(message){
	var args =  message.
		substring(1).
		trim().
		replace(/\s+/g, ' ').
		split(' ');
	if(args.length > 0)
		args[0] = args[0].toLowerCase();
	return args;
}

module.exports.process = function(data){
	var args = getArgs(data.message);
	var result = ECommandResult.Unknown;
	OUTER:
	for(var i = 0; i < cmdCount; i++)
		for(var j = 0; j < cmds[i].names.length; j++)
			if(cmds[i].names[j] == args[0]){
				result = ac.hasAccess(data.steamID.accountid, cmds[i].accessLevel) ?
					cmds[i].exec({
						client: data.client,
						steamID: data.steamID,
						net: data.net,
						args: args
					}) : ECommandResult.NoAccess;
				break OUTER;
			}
	switch(result){
		case ECommandResult.Unknown:
			data.client.chatMessage(data.steamID, "Unknown command. Try !help");
			break;
		case ECommandResult.NoAccess:
			data.client.chatMessage(data.steamID, "You do not have access to this command.");
			break;
	}
}
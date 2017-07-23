const	fs				= require('fs');
var	cmds = [], cmdCount = 0,
	EAccessLevel	= require('../enums/EAccessLevel.js'),
	ECommandResult	= require('../enums/ECommandResult.js');
fs.readdirSync('./cmds/').forEach(file => {
	if(file != "cmdproc.js")
		cmds[cmdCount++] = require('./' + file);
});
console.log("Registered " + cmdCount + " command(s).");

function getArgs(message){
	return message.
		substring(1).
		toLowerCase().
		trim().
		replace(/\s+/g, ' ').
		split(' ');
}

function hasAccess(accountId, members, accessLevel){
	switch(accessLevel){
		case EAccessLevel.Everyone:
			return true;
		case EAccessLevel.VIP:
			return memberOf(members.vips, accountId) || memberOf(members.admins, accountId);
		case EAccessLevel.Admin:
			return memberOf(members.admins, accountId);
		case EAccessLevel.HeadAdmin:
			return memberOf(members.headAdmins, accountId);
	}
	return false;
}

function memberOf(arr, accountId){
	for(var i = 0; i < arr.length; i++){
		if(arr[i].accountid == accountId)
			return true;
	}
	return false;
}

module.exports.process = function(data){
	var args = getArgs(data.message);
	var result = ECommandResult.Unknown;
	OUTER:
	for(var i = 0; i < cmdCount; i++)
		for(var j = 0; j < cmds[i].names.length; j++)
			if(cmds[i].names[j] == args[0]){
				result = hasAccess(data.steamID.accountid, data.members, cmds[i].accessLevel) ?
					cmds[i].exec({client: data.client, steamID: data.steamID, members: data.members, net: data.net, args: args})
					: ECommandResult.NoAccess;
				break OUTER;
			}
	switch(result){
		case ECommandResult.Unknown:
			data.client.chatMessage(data.steamID, "Unknown command.");
			break;
		case ECommandResult.NoAccess:
			data.client.chatMessage(data.steamID, "You do not have access to this command.");
			break;
	}
}
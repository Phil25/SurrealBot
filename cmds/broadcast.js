var	EAccessLevel	= require('../enums/EAccessLevel.js'),
	ECommandResult	= require('../enums/ECommandResult.js');

module.exports.accessLevel	= EAccessLevel.HeadAdmin;
module.exports.names		= ["broadcast", "bc"];
module.exports.description	= "Broadcast a message to certain friends.";

//----------[ Declarations ]----------//

var	bc			= require('../lib/broadcast.js'),
	EFriendFlag	= require('../enums/EFriendFlag.js');


//----------[ Exec ]----------//

module.exports.exec = function(data){
	if(data.args.length < 3){
		data.client.chatMessage(data.steamID, "Usage: " + data.args[0] + " <flags> <message> <...>");
		return ECommandResult.Handled;
	}
	var message = "";
	for(var i = 2; i < data.args.length; i++)
		message += data.args[i] + " ";
	var count = bc.send(getFlagNumber(data.args[1]), message.trim());
	if(count == 0)
		data.client.chatMessage(data.steamID, "No users found.");
	else data.client.chatMessage(data.steamID, "Message sent to users " + count + " user(s).");
	return ECommandResult.Handled;
}

function getFlagNumber(arg){
	arg = arg.toLowerCase();
	var flags = 0;
	switch(arg){
		case 'groupsubscriber':
			flags += EFriendFlag.GroupSubscriber;
			break;
		case 'botsubscriber':
		case 'steambotsubscriber':
			flags += EFriendFlag.BotSubscriber;
			break;
		case 'group':
		case 'groupmember':
		case 'groupmembers':
			flags += EFriendFlag.GroupMember;
			break;
		case 'vip':
		case 'vips':
			flags += EFriendFlag.VIP;
			break;
		case 'mod':
		case 'mods':
			flags += EFriendFlag.Mod;
			break;
		case 'admin':
		case 'admins':
			flags += EFriendFlag.Admin;
			break;
		case 'headadmin':
		case 'headadmins':
			flags += EFriendFlag.HeadAdmin;
			break;
		case 'main':
		case 'maintainer':
			flags += EFriendFlag.Maintainer;
			break;
	}
	return flags;
}
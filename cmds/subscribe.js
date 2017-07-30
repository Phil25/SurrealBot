var	EAccessLevel	= require('../enums/EAccessLevel.js'),
	ECommandResult	= require('../enums/ECommandResult.js');

module.exports.accessLevel	= EAccessLevel.Everyone;
module.exports.names		= ["subscribe", "sub", "unsubscribe", "unsub"];
module.exports.description	= "Subscribe to group events.";

//----------[ Declarations ]----------//

var	friendFlags	= require('../lib/friendFlags.js'),
	EFriendFlag	= require('../enums/EFriendFlag.js');


//----------[ Exec ]----------//

module.exports.exec = function(data){
	if(data.args.length < 2){
		data.client.chatMessage(data.steamID, "Usage: " + data.args[0] + " <group/bot/help>");
		return ECommandResult.Handled;
	}
	var flags = friendFlags.getFlags(data.steamID);
	if(flags == -1){
		data.client.chatMessage(data.steamID, "There has been a problem fetching your data, please try again later.\nIf the problem persists, contact an admin.");
		return ECommandResult.Handled;
	}
	if(data.args[0][0] == 'u'){
		switch(data.args[1]){
			case 'group':
				if(flags & EFriendFlag.GroupSubscriber){
					friendFlags.remFlags(data.steamID, EFriendFlag.GroupSubscriber);
					data.client.chatMessage(data.steamID, "Unsubscribed from group comments.");
				}else
					data.client.chatMessage(data.steamID, "You are not subscribed to group comments.");
				break;
		
			case 'bot':
				if(flags & EFriendFlag.BotSubscriber){
					friendFlags.remFlags(data.steamID, EFriendFlag.BotSubscriber);
					data.client.chatMessage(data.steamID, "Unsubscribed from SteamBot's profile comments.");
				}else
					data.client.chatMessage(data.steamID, "You are not subscribed to SteamBot's profile.");
				break;
		
			case 'help':
				printHelp(data.client, data.steamID, flags);
				break;
		}
	}else{
		switch(data.args[1]){
			case 'group':
				case 'group':
				if(!(flags & EFriendFlag.GroupSubscriber)){
					friendFlags.addFlags(data.steamID, EFriendFlag.GroupSubscriber);
					data.client.chatMessage(data.steamID, "Subscribed to group comments. You may !unsubscribe at any time.");
				}else
					data.client.chatMessage(data.steamID, "You are already subscribed to group comments. Use !unsub to unsubscribe.");
				break;
		
			case 'bot':
				if(!(flags & EFriendFlag.BotSubscriber)){
					friendFlags.addFlags(data.steamID, EFriendFlag.BotSubscriber);
					data.client.chatMessage(data.steamID, "Subscribed to SteamBot's profile comments. You may !unsubscribe at any time.");
				}else
					data.client.chatMessage(data.steamID, "You are already subscribed to SteamBot's profile. Use !unsub to unsubscribe.");
				break;
		
			case 'help':
				printHelp(data.client, data.steamID, flags);
				break;
		}
	}
	return ECommandResult.Handled;
}

function printHelp(client, sid, flags){
	client.chatMessage(sid, "A subscription makes the bot notify you every time a comment is added:\n • group - to the Steam group,\n • bot - to the SteamBot's profile.");
	client.chatMessage(sid, "You are currently subscribed to:");
	if(flags & EFriendFlag.GroupSubscriber)
		client.chatMessage(sid, " • Steam group comments.");
	if(flags & EFriendFlag.BotSubscriber)
		client.chatMessage(sid, " • SteamBot's profile comments.");
}
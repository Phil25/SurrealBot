try{
	var config = require('./config.js');
}catch(err){
	console.error("Error parsing config.js:\n" + err.message);
	return;
}

var SteamUser	= require('steam-user'),
	client		= new SteamUser(),
	SteamTotp	= require('steam-totp'),
	SteamComm	= require('steamcommunity'),
	community	= new SteamComm(),
	cmdProc		= require('./lib/cmdProc.js'),
	net			= require('./lib/net.js'),
	db			= require('./lib/db.js'),
	accessCheck	= require('./lib/accessCheck.js'),
	friendFlags	= require('./lib/friendFlags.js'),
	broadcast	= require('./lib/broadcast.js'),
	EFriendFlag	= require('./enums/EFriendFlag.js');

net.start();
db.start(config);
var members = db.getMembers(config);
accessCheck.setMembers(members);
friendFlags.start(client, config);
broadcast.start(client);

client.logOn({
	"accountName": config.username,
	"password": config.password,
	"twoFactorCode": SteamTotp.getAuthCode(config.sharedSecret)
});

client.on('loggedOn', function(details){
	console.log("Logged into Steam as " + client.steamID.getSteam3RenderedID());
	client.setPersona(SteamUser.EPersonaState.Online);
	//client.gamesPlayed(440);
});

client.on('error', function(e){
	console.error(e);
});

client.on('friendMessage', function(steamID, message){
	if(message[0] == '/' || message[0] == '!'){
		if(members.headAdmins.length > 0)
			cmdProc.process({client: client, steamID: steamID, message: message, net: net });
		else
			client.chatMessage(steamID, "Commands not fully initialized, try again later. If the problem persists, please contact Phil25.");
		return;
	}
	client.chatMessage(steamID, "What?");
});

client.on('webSession', function(sessionID, cookies){
	community.setCookies(cookies);
});

client.on('friendsList', friendFlags.gotFriends);
client.on('nicknameList', friendFlags.gotNicks);
client.on('friendRelationship', friendFlags.onRelationship);

client.on('newComments', function(count, myItems, discussions){//TODO: Broadcast messages to subs... and implement sub system
	console.log("New Comments -> count: " + count + ", " + "myItems: " + myItems + ", " + "discussions: " + discussions);
	if(discussions > 0){
		//client.chatMessage(config.maintainer, discussions + " new comment" + (discussions == 1 ? "" : "s") + " on Surreal Surfing.\nhttps://steamcommunity.com/groups/SurrealSurfing");
		broadcast.send(EFriendFlag.GroupSubscriber, discussions + " new comment" + (discussions == 1 ? "" : "s") + " on Surreal Surfing.\nhttps://steamcommunity.com/groups/SurrealSurfing");
		community.httpRequestGet("https://steamcommunity.com/gid/" + config.groupId64, function(err, res, body){return;}, "steamcommunity");
	}
	if(myItems > 0){
		//client.chatMessage(config.maintainer, myItems + " new comment" + (myItems == 1 ? "" : "s") + " on my profile.\nhttps://steamcommunity.com/id/SurrealSurfing");
		broadcast.send(EFriendFlag.BotSubscriber, myItems + " new comment" + (myItems == 1 ? "" : "s") + " on my profile.\nhttps://steamcommunity.com/id/SurrealSurfing");
		community.httpRequestGet("https://steamcommunity.com/my/", function(err, res, body){return;}, "steamcommunity");
	}
});
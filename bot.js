try{
	var config = require('./config');
}catch(err){
	console.error("Error parsing config.json:\n" + err.message);
	return;
}

var SteamUser	= require('steam-user'),
	client		= new SteamUser(),
	SteamTotp	= require('steam-totp');

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

/*client.on('webSession', function(sessionID, cookies){
	console.log("Got web session");
});

client.on('newItems', function(count){
	console.log(count + " new items in inventory");
});*/
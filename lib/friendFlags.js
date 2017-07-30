var SteamUser	= require('steam-user'),
	SteamID		= require('steamid'),
	accessCheck	= require('./accessCheck.js'),
	broadcast	= require('./broadcast.js'),
	EFriendFlag	= require('../enums/EFriendFlag.js'),
	EAccessLevel= require('../enums/EAccessLevel.js'),
	EMembership	= require('../enums/EMembership.js');

var	client	= null,
	config	= null,
	friends	= false,
	nicks	= false,
	members	= false,
	loaded	= false;

var awaitingCallbacks = 0;

module.exports.start = function(_client, _config){
	client = _client;
	config = _config;
}

module.exports.gotFriends = function(){
	friends = true;
	if(friends && nicks && members)
		onFullyLoaded();
}

module.exports.gotNicks = function(){
	nicks = true;
	if(friends && nicks && members)
		onFullyLoaded();
}

module.exports.gotMembers = function(){
	members = true;
	if(friends && nicks && members)
		onFullyLoaded();
}

module.exports.onRelationship = function(sid, relationship){
	if(!loaded) return;
	if(relationship == SteamUser.EFriendRelationship.RequestRecipient)
		client.addFriend(sid, (err, name) => onNewFriend(SteamID.fromIndividualAccountID(sid.accountid), err));
}

function onFullyLoaded(){
	if(loaded) return;
	Object.keys(client.myFriends).forEach(function(steamid){
		switch(client.myFriends[steamid]){
			case SteamUser.EFriendRelationship.RequestRecipient:
				awaitingCallbacks++;
				client.addFriend(steamid, (err, name) => onNewFriend(steamid, err));
			break;
			case SteamUser.EFriendRelationship.Friend:
				if(_getFlags(steamid) == -1)
					client.myNicknames[steamid] = "000" + setupFlags(steamid);
			break;
		}
	});
	if(awaitingCallbacks == 0)
		broadcast.onFullyLoaded();
	loaded = true;
}

function onNewFriend(steamid, err){
	if(err){
		console.error("[ERROR] Could not accept friend: " + steamid);
		if(--awaitingCallbacks == 0)
			broadcast.onFullyLoaded();
		return;
	}
	client.setNickname(steamid, "00" + setupFlags(steamid), function(err){
		if(err)
			console.error("[ERROR] Could not set up flags for " + steamid);
		if(--awaitingCallbacks == 0)
			broadcast.onFullyLoaded();
	});
}

function setupFlags(steamid){
	var flags = 0;
	if(accessCheck.isMemberOf(steamid, EMembership.VIP))
		flags += EFriendFlag.VIP;
	if(accessCheck.isMemberOf(steamid, EMembership.Mod))
		flags += EFriendFlag.Mod;
	if(accessCheck.isMemberOf(steamid, EMembership.Admin))
		flags += EFriendFlag.Admin;
	if(accessCheck.isMemberOf(steamid, EMembership.HeadAdmin))
		flags += EFriendFlag.HeadAdmin;
	if(steamid == config.maintainer)
		flags += EFriendFlag.Maintainer;
	return flags;
}

function displayFlags(flags){
	var sflags = "{";
	for(var i = 1; i <= 128; i*=2)
		if(flags & i)
			sflags += "\n" + EFriendFlag[i];
	return sflags + "\n}";
}

var _getFlags = function(sid){
	var flags = -1;
	Object.keys(client.myNicknames).forEach(function(steamid){
		if(sid == steamid){
			flags = client.myNicknames[steamid];
			return;
		}
	});
	return flags;
};

var _addFlags = function(sid, flag){
	var newFlags = client.myNicknames[sid] | flag;
	client.setNickname(sid, "00" + newFlags);
};

var _remFlags = function(sid, flag){
	var newFlags = client.myNicknames[sid] & ~flag;
	client.setNickname(sid, "00" + newFlags);
};

module.exports.getFlags = _getFlags;
module.exports.addFlags = _addFlags;
module.exports.remFlags = _remFlags;
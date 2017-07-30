var EAccessLevel	= require('../enums/EAccessLevel.js'),
	EMembership		= require('../enums/EMembership.js');
var members = null;

module.exports.setMembers = function(mem){
	members = mem;
}

module.exports.getMembers = function(){
	return members;
}

module.exports.hasAccess = function(steamid, accessLevel){
	if(members == null){
		console.error("[ERROR] Members unknown during access check for: " + steamid);
		return false;
	}

	switch(accessLevel){
		case EAccessLevel.Everyone:
			return true;
		case EAccessLevel.VIP:
			return memberOf(members.vips, steamid) || memberOf(members.admins, steamid);
		case EAccessLevel.Admin:
			return memberOf(members.admins, steamid);
		case EAccessLevel.HeadAdmin:
			return memberOf(members.headAdmins, steamid);
	}
	return false;
}

module.exports.isMemberOf = function(steamid, membership){
	if(members == null){
		console.error("[ERROR] Members unknown during access check for: " + steamid);
		return false;
	}

	switch(membership){
		case EMembership.VIP:
			return memberOf(members.vips, steamid);
		case EMembership.Admin:
			return memberOf(members.admins, steamid);
		case EMembership.HeadAdmin:
			return memberOf(members.headAdmins, steamid);
	}
	return false;
}

function memberOf(arr, steamid){
	for(var i = 0; i < arr.length; i++)
		if(arr[i] == steamid)
			return true;
	return false;
}
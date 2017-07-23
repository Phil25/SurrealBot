var EAccessLevel	= require('../enums/EAccessLevel.js');
var members;

module.exports.setMembers = function(mem){
	members = mem;
}

module.exports.hasAccess = function(accountId, accessLevel){
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
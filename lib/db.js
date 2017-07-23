var	MySQL		= require('mysql'),
	SteamIDConv	= require('steamid');

var conn;
module.exports.start = function(config){
	conn = MySQL.createConnection({
		host:		config.database.host,
		user:		config.database.user,
		password:	config.database.password,
		database:	config.database.database
	});
	conn.connect();
}

module.exports.query = function(query, callback){
	conn.query(query, callback);
}

var headAdminCount = 0, adminCount = 0, vipCount = 0, oneReady = false;
module.exports.getMembers = function(config){
	var admins = [], headAdmins = [], vips = [];
	conn.query('SELECT `auth`, `type` FROM `admins`', function(err, res, fields){
		if(err){
			console.error('[ERROR] Cannot fetch admins:\n' + err.message);
			return;
		}
		for(var i = 0; i < res.length; i++){
			if(res[i].type == 0)
				headAdmins.push(SteamIDConv.fromIndividualAccountID(res[i].auth));
			admins.push(SteamIDConv.fromIndividualAccountID(res[i].auth));
		}
		headAdminCount = headAdmins.length;
		adminCount = admins.length;
		printFetch();
	});
	conn.query('SELECT `auth`, `active` FROM `donators_new`', function(err, res, fields){
		if(err){
			console.error('[ERROR] Cannot fetch VIPs:\n' + err.message);
			return;
		}
		for(var i = 0; i < res.length; i++){
			if(res[i].active == 1)
				vips.push(SteamIDConv.fromIndividualAccountID(res[i].auth));
		}
		vipCount = vips.length;
		printFetch();
	});
	return {headAdmins: headAdmins, admins: admins, vips: vips};
}

function printFetch(){
	if(!oneReady){
		oneReady = true;
		return;
	}
	console.log("Fetched: " + headAdminCount + " head admins, " + adminCount + " admins, " + vipCount + " vips.");
}
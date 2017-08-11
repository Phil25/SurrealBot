var	MySQL	= require('mysql'),
	SteamID	= require('steamid');

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

var headAdminCount = 0, adminCount = 0, modCount = 0, vipCount = 0, oneReady = false;
module.exports.getMembers = function(config){
	var admins = [], headAdmins = [], mods = [], vips = [];
	conn.query('SELECT auth64, type FROM `staff`', function(err, res, fields){
		if(err){
			console.error('[ERROR] Cannot fetch admins:\n' + err.message);
			return;
		}
		for(var i = 0; i < res.length; i++){
			mods.push(res[i].auth64);
			if(res[i].type < 2){
				admins.push(res[i].auth64);
				if(res[i].type < 1)
					headAdmins.push(res[i].auth64);
			}
		}
		headAdminCount = headAdmins.length;
		adminCount = admins.length;
		modCount = mods.length;
		printFetch();
	});
	conn.query('SELECT auth FROM `donators_new` WHERE active=1', function(err, res, fields){
		if(err){
			console.error('[ERROR] Cannot fetch VIPs:\n' + err.message);
			return;
		}
		for(var i = 0; i < res.length; i++)
			vips.push(SteamID.fromIndividualAccountID(res[i].auth));
		vipCount = vips.length;
		printFetch();
	});
	return {headAdmins: headAdmins, admins: admins, mods: mods, vips: vips};
}

function printFetch(){
	if(!oneReady){
		oneReady = true;
		return;
	}
	console.log("Fetched head admins(" + headAdminCount + "), admins(" + adminCount + "), mods(" + modCount + ") and vips(" + vipCount + ").");
	require('./friendFlags.js').gotMembers();
}
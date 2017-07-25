var	Network	= require('net'),
	config	= require('../config.js');

module.exports.start = function(){
	Network.createServer(handleServer).listen(config.listenPort);
	console.log('Server set up on port ' + config.listenPort);
}

var clients = [];

function handleServer(conn){
	for(var i in clients)
		if(clients[i].remoteAddress == conn.remoteAddress)
			return;
	clients.push(conn);
	console.log('New connection from: ' + conn.remoteAddress + ':' + conn.remotePort);
	conn.on('data', function(data){
		var dataObject = getDataObject(data.toString('utf8'));
		if(!dataObject)
			return;
		switch(dataObject.type){
		
			case 'reg':
				var serverId = -1;
				OUTER:
				for(var i in config.servers)
					for(var j in config.servers[i].calls)
						if(config.servers[i].calls[j] == dataObject.msg){
							serverId = i;
							break OUTER;
						}
				if(serverId == -1){
					console.log('[WARNING] ' + conn.remoteAddress + ':' + conn.remotePort + ' trying to register non-existent server "' + dataObject.msg + '".');
					return;
				}
				for(var i in clients)
					if(clients[i].serverName == dataObject.msg){
						console.log('[WARNING] ' + conn.remoteAddress + ':' + conn.remotePort + ' trying to register another "' + dataObject.msg + '".');
						return;
					}
				var index = clients.indexOf(conn);
				clients[index].serverName	= config.servers[serverId].name;
				clients[index].serverCalls	= config.servers[serverId].calls;
				console.log('Registered server "' + dataObject.msg + '" from: ' + conn.remoteAddress + ':' + conn.remotePort);
			break;
		
			case 'vipRefetch':
				console.log('VIP refetch initiated.');
				for(var i in clients)
					clients[i].write('sm_refetchvips');
				//data.fetchVips();
			break;
		
			case 'vipTags':
				console.log('VIP tag refetch initiated.');
				for(var i in clients)
					clients[i].write('sm_refetchviptags');
			break;
		
			default:
				console.log('Invalid input -> TYPE:' + dataObject.type + ', MSG:' + dataObject.msg);
			break;
		
		}
	});
	conn.on('close', function(){
		clients.splice(clients.indexOf(conn), 1);
		console.log('Closed connection from: ' + conn.remoteAddress + ':' + conn.remotePort);
	});
	conn.on('error', function(err){
		clients.splice(clients.indexOf(conn), 1);
		console.log('[ERROR] Connection from: ' + conn.remoteAddress + ':' + conn.remotePort + ' encountered an error: ' + err.message);
	});
}

function getDataObject(datastring){
	if(datastring.charAt(0) != '.')
		return null;

	var endType = datastring.indexOf(":");
	if(endType == -1)
		return null;

	return dataObject = {
		type: datastring.slice(1, endType),
		msg: (endType == datastring.length) ? '' : datastring.slice(endType+1, datastring.length)
	};
}

module.exports.send = function(server, command){
	for(var i in clients)
		for(var j in clients[i].serverCalls)
			if(clients[i].serverCalls[j] == server){
				clients[i].write(command);
				return true;
			}
	return false;
}
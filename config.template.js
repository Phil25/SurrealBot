module.exports = {

	username: "",
	password: "",

	sharedSecret: "XXXXXXXXXXXXXXXXXXXXXX=", //Equal sign at the end included
	identitySecret: "", //Unused

	groupid64: "", //Group ID 64 the bot is assosiated with

	listenPort: 6451,

	database: {
		host: "",
		user: "",
		password: "",
		database: ""
	},

	servers: [
		{
			name:	"Server 1",
			calls:	["server1", "s1", "serv1", "serv"], //First call should be default shorthand server name
			ip:		"0.0.0.0",
			port:	27015
		},
		{
			name:	"Server 2",
			calls:	["server2", "s2", "serv2"],
			ip:		"0.0.0.1",
			port:	27016
		}
	]

}; 
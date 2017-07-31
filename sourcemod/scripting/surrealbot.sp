#pragma semicolon 1


#include <sourcemod>
#include <socket>
#include <basecomm>
#include <hl_cleverbotapi>


#define TALK_INTERVAL	1.0


Handle	g_hMsgArray		= INVALID_HANDLE;
float	g_fNextMessage	= 0.0;
char	g_sConvoId[128];

Handle	g_hClientSocket	= null;
char	g_sRegMessage[24], g_sCmdResponse[2048];

ConVar g_hCvarIp;	char	g_sCvarIp[64]	= "localhost";
ConVar g_hCvarPort;	int		g_iCvarPort		= 1234;

ConVar g_hCvarApiKey;	char g_sCvarApiKey[64]	= "none";
ConVar g_hCvarBotName;	char g_sCvarBotName[64]	= "SurrealBot";
ConVar g_hCvarNameColor;char g_sCvarNameColor[8]= "669aaf";
ConVar g_hCvarTextColor;char g_sCvarTextColor[8]= "a0c8d7";


public Plugin myinfo = {

	name = "SurrealBot",
	author = "Phil25",
	description = "Surreal Surfing SteamBot.",
	url = "https://github.com/Phil25/SurrealBot"

};


//***********************//
//  -  G E N E R A L  -  //
//***********************//

public void OnPluginStart(){

	LoadTranslations("common.phrases.txt");
	g_hMsgArray = CreateArray(255);

	g_hCvarIp		= CreateConVar("sm_surrealbot_ip",		g_sCvarIp, "IP to the SurrealBot", FCVAR_NOTIFY);
	g_hCvarIp.AddChangeHook(ConVarChange_Ip);				g_hCvarIp.GetString(g_sCvarIp, sizeof(g_hCvarNameColor));
	g_hCvarPort		= CreateConVar("sm_surrealbot_port",	"1234", "Port to the SurrealBot", FCVAR_NOTIFY);
	g_hCvarPort.AddChangeHook(ConVarChange_Port);			g_iCvarPort = g_hCvarPort.IntValue;

	g_hCvarApiKey	= CreateConVar("sm_surrealbot_apikey",	g_sCvarApiKey, "Cleverbot API Key, disables functionality if not given.", FCVAR_NOTIFY);
	g_hCvarApiKey.AddChangeHook(ConVarChange_ApiKey);		g_hCvarApiKey.GetString(g_sCvarApiKey, sizeof(g_sCvarApiKey));
	g_hCvarBotName	= CreateConVar("sm_surrealbot_botname", g_sCvarBotName, "Name SurrealBot will answer to.", FCVAR_NOTIFY);
	g_hCvarBotName.AddChangeHook(ConVarChange_BotName);		g_hCvarBotName.GetString(g_sCvarBotName, sizeof(g_sCvarBotName));
	g_hCvarNameColor= CreateConVar("sm_surrealbot_namecolor", g_sCvarNameColor, "Bot name color in chat.", FCVAR_NOTIFY);
	g_hCvarNameColor.AddChangeHook(ConVarChange_NameColor);	g_hCvarNameColor.GetString(g_sCvarNameColor, sizeof(g_sCvarNameColor));
	g_hCvarTextColor= CreateConVar("sm_surrealbot_textcolor", g_sCvarTextColor, "Bot text color in chat.", FCVAR_NOTIFY);
	g_hCvarTextColor.AddChangeHook(ConVarChange_TextColor);	g_hCvarTextColor.GetString(g_sCvarTextColor, sizeof(g_hCvarNameColor));

	RegAdminCmd("bot_say", Command_BotSay, ADMFLAG_RCON, "Say something as bot.");
	CreateTimer(5.0, Timer_OnPluginStartPost);

}

void Bot_Say(const char[] sMessage, bool bProlong=false){

	if(bProlong){
		PushArrayString(g_hMsgArray, sMessage);
		CreateTimer(0.25, Timer_Respond);
		return;
	}

	PrintToServer("> %s: %s", g_sCvarBotName, sMessage);
	PrintToChatAll("\x07%s%s\x01 :  \x07%s%s", g_sCvarNameColor, g_sCvarBotName, g_sCvarTextColor, sMessage);

}

public Action Timer_Respond(Handle hTimer, any aData){

	if(GetArraySize(g_hMsgArray) <= 0)
		return Plugin_Stop;

	char sMessage[255];
	GetArrayString(g_hMsgArray, 0, sMessage, 255);
	RemoveFromArray(g_hMsgArray, 0);
	Bot_Say(sMessage);

	return Plugin_Stop;

}

public Action OnClientSayCommand(int client, const char[] sCommand, const char[] sArgs){

	if(strlen(g_sCvarApiKey) < 10)
		return Plugin_Continue;

	if(client != 0 && BaseComm_IsClientGagged(client))
		return Plugin_Continue;

	if(!IsBotAddressed(sArgs))
		return Plugin_Continue;

	float fThisTime = GetEngineTime();
	if(g_fNextMessage > fThisTime)
		return Plugin_Continue;
	g_fNextMessage = fThisTime +TALK_INTERVAL;

	char sMessage[255];
	Format(sMessage, 255, "%s", sArgs);
	ReplaceString(sMessage, 8, ";", "", false);
	CleverBot_SendRequest(g_sCvarApiKey, sMessage, CleverBot_Callback, g_sConvoId, 0);

	return Plugin_Continue;

}

bool IsBotAddressed(const char[] sMsg){

	return (
		(
			sMsg[0] == ';'
			&&
			(
				IsCharAlpha(sMsg[1])	||
				IsCharNumeric(sMsg[1])	||
				IsCharSpace(sMsg[1])
			)
		)
		||
		(
			StrContains(sMsg, g_sCvarBotName, false) != -1
		)
	);

}

public void CleverBot_Callback(char[] sResponse, char[] sConvoId, ArrayList arChatHistory, StatusCode statusCode, int client, int iRandomNumber){

	if(statusCode != StatusCode_Success){
		char sError[128];
		CleverBot_GetErrorLogString(statusCode, sError, 128);
		LogError("[SurrealBot] Error (%d): %s", statusCode, sError);
		return;
	}

	if(strlen(sResponse) <= 0)
		return;

	strcopy(g_sConvoId, 255, sConvoId);
	Bot_Say(sResponse);

}


//*********************//
//  -  C O N V A R  -  //
//*********************//

public int ConVarChange_Ip(Handle hCvar, const char[] sOld, const char[] sNew){
	strcopy(g_sCvarIp, sizeof(g_sCvarIp), sNew);
}
public int ConVarChange_Port(Handle hCvar, const char[] sOld, const char[] sNew){
	g_iCvarPort = StringToInt(sNew);
}

public int ConVarChange_ApiKey(Handle hCvar, const char[] sOld, const char[] sNew){
	strcopy(g_sCvarApiKey, sizeof(g_sCvarApiKey), sNew);
}
public int ConVarChange_BotName(Handle hCvar, const char[] sOld, const char[] sNew){
	strcopy(g_sCvarBotName, sizeof(g_sCvarBotName), sNew);
}
public int ConVarChange_NameColor(Handle hCvar, const char[] sOld, const char[] sNew){
	strcopy(g_sCvarNameColor, sizeof(g_sCvarNameColor), sNew);
}
public int ConVarChange_TextColor(Handle hCvar, const char[] sOld, const char[] sNew){
	strcopy(g_sCvarTextColor, sizeof(g_sCvarTextColor), sNew);
}


//*************************************//
//  -  B O T   N E T W O R K I N G  -  //
//*************************************//

public Action Timer_OnPluginStartPost(Handle hTimer){

	ConnectToBot();
	return Plugin_Stop;

}

void ConnectToBot(){

	char sServerName[32];
	FindConVar("hostname").GetString(sServerName, 32);

	if(StrContains(sServerName, "test server", false) != -1)
		strcopy(g_sRegMessage, 24, ".reg:test");

	else if(StrContains(sServerName, "10x_redone", false) != -1)
		strcopy(g_sRegMessage, 24, ".reg:10x");

	else if(StrContains(sServerName, "snow_arena", false) != -1)
		strcopy(g_sRegMessage, 24, ".reg:snow");

	else if(StrContains(sServerName, "overlook", false) != -1)
		strcopy(g_sRegMessage, 24, ".reg:overlook");

	else if(StrContains(sServerName, "greatfissure", false) != -1)
		strcopy(g_sRegMessage, 24, ".reg:greatfissure");

	g_hClientSocket = SocketCreate(SOCKET_TCP, Socket_OnError);
	SocketSetOption(g_hClientSocket, SocketKeepAlive, 1);

	PrintToServer("Establishing connection to SurrealBot...");
	SocketConnect(g_hClientSocket, Socket_OnConnected, Socket_OnChildReceive, Socket_OnChildDisconnected, g_sCvarIp, g_iCvarPort);

}

public int Socket_OnConnected(Handle hSocket, any arg){

	PrintToServer("> > > Connection to SurrealBot established (sent %s)", g_sRegMessage);
	SocketSend(g_hClientSocket, g_sRegMessage, strlen(g_sRegMessage));

}

public int Socket_OnError(Handle hSocket, const int iErrorType, const int iErrorNum, any arg){

	LogError("Socket error %d (%d)", iErrorType, iErrorNum);
	delete hSocket;
	hSocket = null;
	ConnectToBot();

}

public int Socket_OnChildReceive(Handle hSocket, char[] sData, const int iDataSize, any aFile){

	ServerCommandEx(g_sCmdResponse, 2048, sData);
	Format(g_sCmdResponse, 2048, ".res:%s", g_sCmdResponse);
	SocketSend(hSocket, g_sCmdResponse, strlen(g_sCmdResponse));

}

public int Socket_OnChildDisconnected(Handle hSocket, any aFile){

	PrintToServer("> > > Connection to SurrealBot lost!");
	delete hSocket;
	hSocket = null;
	ConnectToBot();

}


//*************************//
//  -  C O M M A N D S  -  //
//*************************//

public Action Command_BotSay(int client, int args){

	if(args < 1){
	
		ReplyToCommand(client, "[SM] Usage: bot_say <message>");
		return Plugin_Handled;
	
	}

	char sMessage[255];
	char sArg[48];
	for(int i = 1; i <= args; i++){
		GetCmdArg(i, sArg, 255);
		Format(sMessage, 255, "%s %s", sMessage, sArg);
	}

	Bot_Say(sMessage);

	return Plugin_Handled;

}
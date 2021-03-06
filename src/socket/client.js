// Socket as Client (Connected to the bot) (Initiates Connection)
require("dotenv").config();
const ServerSocket = require("./server.js");
const { io } = require("socket.io-client");
const config = require("../../config.js");
const socket = io.connect( process.env.DISCORDBOTURL || config.discordBotUrl , { reconnection: true, secure: true });

class BotSocket{
    constructor(){
        this.guilds = [];
    }
    init(server, sessionMiddleware){
        this.socket = socket;
        this.browserSocket = new ServerSocket(server, sessionMiddleware);
        this.browserSocket._init(this.socket, this);

        // Asks for the guilds that the bot is in
        this.socket.emit('getGuilds');

        // Listeners (Things emitted by the bot)
        
        // Since we are just redirecting all data from the bot to the browser. I'll just set the listener to on any
        
        socket.onAny((e, args = {}) => {
            console.log('Acquiring data from bot');
            console.log(args);

            if(e == "recGuilds"){
                this.guilds = args.guild;
                return;
            }
            if(!args.guild) return;
        
            // Redirect the response to browsers that inside on a room defined by their guildID
            this.browserSocket.io.to(args.guild).emit(e, args);
        })

    }
}


module.exports = BotSocket;
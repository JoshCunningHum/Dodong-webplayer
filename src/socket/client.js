// Socket as Client (Connected to the bot) (Initiates Connection)
require("dotenv").config();
const ServerSocket = require("./server.js");
const { io } = require("socket.io-client");
const socket = io.connect( process.env.DISCORDBOTURL || config.discordBotUrl , { reconnection: true, secure: true });

class BotSocket{
    init(server){
        this.socket = socket;
        this.browserSocket = new ServerSocket(server);
        this.browserSocket._init(this.socket);

        // Listeners (Things emitted by the bot)
        
        // Since we are just redirecting all data from the bot to the browser. I'll just set the listener to on any
        
        socket.onAny((e, args = {}) => {
            console.log(args);
            if(e == "recGuilds"){
                browserSocket.io.to(args.id).emit("recGuilds", args.guild);
                return;
            }
            if(!args.guild) return;
        
            console.log(args);
        
            // Redirect the response to browsers that inside on a room defined by their guildID
            browserSocket.io.to(args.guild).emit(e, args);
        })
    }
}


module.exports = BotSocket;
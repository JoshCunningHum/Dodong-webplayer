// Socket as Server (Connected to the player)
require("dotenv").config();

const io = require('socket.io')(process.env.PORT || 3001, { cors: "*", method: ["GET", "POST"]});

class Server{
    constructor(){
        this.io = io;
    }
    _init(botSocket){
        this.io.on('connection', socket => {
            console.log(`Player Connection detected: ${socket.id}`);

            socket.onAny((e, args = {}) => {
                console.log(e, args);

                // Special case
                if(e == "getGuilds"){
                    botSocket.emit(e, {id: socket.id});
                    return;
                }

                if(!args.guild) return;
        
                // For autoupdates
                if(e == "joinGuild"){
                    socket.join(args.guild);
                }
        
                // Redirect the args to the bot with event name
                botSocket.emit(e, args);
            });

        })
    }
}


module.exports = Server;
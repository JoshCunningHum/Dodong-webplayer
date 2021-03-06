// Socket as Server (Connected to the player)
require("dotenv").config();
const passport = require('passport');
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

class Server{
    constructor(server, sessionMiddleware){
        this.io = require('socket.io')(server);
        this.io.use(wrap(sessionMiddleware));
        this.io.use(wrap(passport.initialize()));
        this.io.use(wrap(passport.session()));
    }
    _init(botSocket, botSocketObject){

        this.io.use((socket, next) => {
            if (socket.request.user) {
                console.log(`Browser socket ${socket.id} authorized!`);
                next();
            } else {
                next(new Error('unauthorized'))
            }
        });
        this.io.on('connection', socket => {
            console.log(`Player Connection detected: ${socket.id}`);

            socket.onAny((e, args = {}) => {
                console.log('Acquiring Emit from the browser: ' + socket.id);
                console.log.log(e, args);

                // Special case : Sends the guild array instead of asking guilds on the bot
                if(e == "getGuilds"){
                    socket.emit("recGuilds", botSocketObject.guilds);
                    return;
                }

                if(!args.guild) return;
        
                // For autoupdates
                if(e == "joinGuild"){
                    socket.join(args.guild);
                    return;
                }
        
                // Redirect the args to the bot with event name
                botSocket.emit(e, args);
            });

        })
    }
}


module.exports = Server;
const socket = io.connect(discordBotUrl, {
    reconnection: false,
    secure: true
});

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    guildID = urlParams.get("guildID");

    recCurrentSong();

    // Monitors connection status
    socket.on('connect', () => {
        changeConnectStatus(socket.connected);

        // Force this socket to enter the guild room
        socket.emit('joinGuild', guildID);

        requestData();
    });

    socket.on('forceUpdate', () => {
        requestData();
        console.log("forceUpdate signal received");
    })

    socket.on('recGuild', (res)=>{
        recGuildName(res);
    });
    socket.on('recQueue', (res) => {
        recQueue(res);
    });
    socket.on('recCurrentSong', (res) => {
        recCurrentSong(res);
    })
    socket.on('log', (res) => {
        console.log(`Logging Someting`);
        console.log(res);
    })

    setInterval( () => {
        changeConnectStatus(socket.connected);
    }, 1000);
}


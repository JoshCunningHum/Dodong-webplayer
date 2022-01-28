const socket = io.connect(discordBotUrl, {
    reconnection: false,
    secure: true,
    'timeout': 5000,
    'connect timeout': 5000
});

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    guildID = urlParams.get("guildID");

    recData();

    // Monitors connection status
    socket.on('connect', async () => {
        changeConnectStatus(socket.connected);

        // Force this socket to enter the guild room
        socket.emit('joinGuild', guildID);

        requestData();
    });

    socket.on('forceUpdate', async () => {
        requestData();
        console.log("forceUpdate signal received");
    })

    // For Receiving Data (All in One)
    socket.on("recData", async (res) => {
        recData(res);
    })


    // Development Purposes
    socket.on('log', async (res) => {
        console.log(`Logging Someting`);
        console.log(res);
    })

    setInterval( () => {
        changeConnectStatus(socket.connected);
    }, 1000);

    changePage(0);
}


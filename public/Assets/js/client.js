const socket = io.connect(discordBotUrl, {
    reconnection: false,
    secure: true,
    'timeout': 5000,
    'connect timeout': 5000
});

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    guildID = urlParams.get("guildID");

    changePage(0);
    recData({
        guildName: "Guild Sample"
    });

    // Monitors connection status
    socket.on('connect', async () => {
        changeConnectStatus(socket.connected);

        // Force this socket to enter the guild room
        socket.emit('joinGuild', guildID);

        requestData();
    });

    socket.on('forceUpdate', async (res) => {
        requestData();
        console.log("ForceUpdate from: " + res.from);
    })

    // For Receiving Data (All in One)
    socket.on("recData", (res) => {
        recData(res);
    })


    // Development Purposes
    socket.on('log', async (res) => {
        console.log(`Logging Someting`);
        console.log(res);
    })

    // Error
    socket.on('error', async (err) => {
        displayError(err);
    } )

    setInterval( () => {
        changeConnectStatus(socket.connected);
    }, 1000);

}


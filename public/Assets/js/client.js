var socket;

window.onload = () => {

    socket = io.connect(discordBotUrl, {
        reconnection: false,
        secure: true
    });


    changePage(0);
    disableNav();
    // recData({
    //     guildName: "Guild Sample"
    // });

    if(!guildID){
        displayError({
            type: "NO_GUILD"
        })
    }else{
        changePage(1);
        disableNav(false);
    }

    // Updates the guild select option for the login page
    updateGuildSelect();

    // Monitors connection status
    socket.on('connect', async () => {
        changeConnectStatus(socket.connected);

        // Force this socket to enter the guild room
        socket.emit('joinGuild', guildID);

        // Waits for 0.25 second - fix for the webplayer being unreponsive on first visit
        setTimeout(() => {
            requestData();
        }, 250);
    });

    socket.on('forceUpdate', async (res) => {
        requestData();
        console.log("ForceUpdate from: " + res.from);
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

    // Error
    socket.on('error', async (err) => {
        displayError(err);
    } )

    setInterval( () => {
        changeConnectStatus(socket.connected);
    }, 1000);

    // Makes the queue container sortable
    $("#queue-container").sortable({
        axis: "y",
        update: function(event, ui) {
            console.log("Reordered");
        }
    })
}


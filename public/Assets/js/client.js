"use strict";
window.onload = () => {
    _init();
}

function _init() {



    socket = io(); // https://socket.io/docs/v4/client-initialization/#from-the-same-domain

    changePage("login");
    disableNav();

    if (!guildID) {
        displayError({
            type: "NO_GUILD"
        })
    } else {
        changePage();
        disableNav(false);
    }

    // Monitors connection status
    socket.on('connect', async () => {
        changeConnectStatus(socket.connected);

        // Force this socket to enter the guild room
        socket.emit('joinGuild', {
            guild: guildID
        });

        // Waits for 0.25 second - fix for the webplayer being unreponsive on first visit
        setTimeout(() => {
            requestData();

            // Get all guild IDs the socket/bot is in
            socket.emit('getGuilds');
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

    socket.on("recGuilds", async (res) => {
        recGuilds(res);
    })


    // Development Purposes
    socket.on('log', async (res) => {
        console.log(`Logging Someting`);
        console.log(res);
    })

    // Error
    socket.on('error', async (err) => {
        displayError(err);
    })

    setInterval(() => {
        changeConnectStatus(socket.connected);
    }, 1000);

    // Front End Adjustments
    setFixedHeights();
}
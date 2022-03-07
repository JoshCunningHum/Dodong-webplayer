"use strict";

function requestData() {
    console.clear();

    // request for Data
    socket.emit("getData", {
        guild: guildID
    });


    // TODO : Cooldown for requesting data
    // Does not restrict users, only delays requests

}

async function recGuilds(botGuildIds) {

    // update session info
    let response = await fetch('/session', {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer'
    });
    session = await response.json();

/*
session can be used to get user info, avatar, and user's guilds
- put the session fetch in a separate function?
- pass this to discordPlayerControl()? or at least just the session/user id
    to identify which user performed the action (e.g. added a searchresult, pause, skip, etc)
- a small section in the page to show user info?

PS: to get avatars/icons
for users: https://cdn.discordapp.com/avatars/${session.id}/${session.avatar}
    example: https://cdn.discordapp.com/avatars/299715820219793420/c684581d0e1775cc29962dfe2863148b
for guilds: https://cdn.discordapp.com/icons/${id}/${icon}  id and icon properties from the guild object
    example: https://cdn.discordapp.com/icons/706460727573217381/561ba60d3a67752a7d7b3e5bdd9dab86
*/

    // update available guilds (guilds that both the bot and the user are a member of)
    availableGuilds = await session.guilds.filter(sessionGuild => 
        !!botGuildIds.find(id => id === sessionGuild.id)
    );

    // Updates the guild select option for the login page
    updateGuildSelect();
}

function recData(res) {
    console.log(`Updating Player`);
    console.log(res);

    // Default : If there are no next tracks
    const queueCont = document.getElementById("queue-container");
    queueCont.innerHTML = "";
    queueCont.classList.remove("empty");

    // If no guild is found, it receives an undefined data
    if (res == null) {
        display("Error: this link seems to be outdated or modified. GUILD_ID no match. If I am wrong then try to refresh");
        socket.disconnect();

        return;
    }

    // Guild Name Update
    document.getElementById("import_guildName").innerHTML = res.guildName;

    // If no queue is found
    if (!res.current) {
        queueCont.innerHTML = "There are no upcoming songs";
        queueCont.classList.add("empty");

        document.getElementById("import_cTitle").innerHTML = "No song is currently being played";
        document.getElementById("import_cAuthor").innerHTML = "";
        document.getElementById("import_cRequestor").innerHTML = "Try adding one on discord or in here";
        document.getElementById("import_cDuration").innerHTML = 0;

        return;
    }

    let trackCount = 0;

    // Queue Update
    for (let i of res.tracks) {
        const inner = `
            <div data-value-id="order">${trackCount+1}</div>
            <div data-value-id="title">${i.title}</div>
            <div data-value-id="author">${i.author}</div>
            <div data-value-id="requestor">${i.requestedBy.username}</div>
            <div data-value-id="duration">${i.duration}</div>
        `;

        const queueItem = document.createElement("div");
        queueItem.classList.add("queue_item");
        queueItem.innerHTML = inner;
        queueItem.dataset.index = trackCount;

        const delBtn = document.createElement("btn");
        delBtn.innerHTML = "❌";
        delBtn.classList.add("delTrack", "flex", "justify-center", "align-center");
        delBtn.addEventListener("click", function () {
            deleteTrack(this);
        });

        queueItem.append(delBtn);
        queueCont.append(queueItem);

        if(i.requestedBy.bot){
            queueItem.querySelector('[data-value-id="requestor"]').classList.add("bot");
        }

        trackCount++;
    }

    // Cut long text
    _cutLongTextInQueue();

    // Makes the queue container sortable / reorder-able
    $("#queue-container").sortable({
        axis: "y",
        update: _moveUpdate
    })

    // Current song details
    document.getElementById("import_cTitle").innerHTML = res.current.title;
    document.getElementById("import_cAuthor").innerHTML = res.current.author;
    document.getElementById("import_cRequestor").innerHTML = res.current.requestedBy;
    document.getElementById("import_cDuration").innerHTML = res.current.duration;
    seekRange.dataset.max = Math.floor(res.current.durationMS / 1000);
    document.getElementById("import_cThumbnail").setAttribute("src", res.current.thumbnail);
    // TODO: BASE64 Audio for Audio Visualizer


    // Global Variables
    cSongDuration = res.current.durationMS;
    inVoiceChannel = res.inVoiceChannel;

    // Loop State Update
    const repeatButton = document.getElementById("repeatBtn");
    switch (res.repeatMode) {
        case 2:
            repeatButton.dataset.state = "2";
            repeatButton.classList.add("active");
            break;
        case 0:
            repeatButton.dataset.state = "0";
            repeatButton.classList.remove("active");
            repeatButton.innerHTML = repQSVG;
            break;
        default:
        case 1:
            repeatButton.dataset.state = "1";
            repeatButton.classList.add("active");
            repeatButton.innerHTML = repTSVG;
            break;
    }

    // Volume
    const volumeSlider = document.getElementById("volume-slider");
    _volSlide(volumeSlider, res.volume);

    // Pause / Resume & Slider Interval
    if (res.playing) {
        stateToggler.innerHTML = pauseSVG;
        stateToggler.dataset.state = "play";
        stateToggler.classList.add("paused");
        startRangeAnimation(res.current.progress, res.current.durationMS);
    } else {
        stateToggler.innerHTML = playSVG;
        stateToggler.dataset.state = "pause";
        stateToggler.classList.remove("paused");
        clearInterval(progressInterval);
    }
}

function displayError(err) {
    switch (err.type) {
        case "NO_GUILD":
            changePage("login");
            disableNav();
            if (!socket.connected) return;
            console.error(`GUILD_ID: ${err.guildID} not found on discord bot`);
            break;
    }
}
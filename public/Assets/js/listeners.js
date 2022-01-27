function requestData(){
    console.clear();

    // Request for GuildName
    socket.emit('getGuild', guildID);

    // Request for queue
    socket.emit('getQueue', guildID);

    // Request for current song
    socket.emit('getCurrentSong', guildID);
}

function recGuildName(res){
    if(res == null){
        display("Error: This link seems to be outdated or modified. GUILD_ID no match. If I am wrong then try to refresh")
        socket.disconnect();
        return;
    }

    res = JSON.parse(res);

    guildName = res.name;
    document.getElementById("import_guildName").innerHTML = res.name;
}

function recQueue(res){
    console.log(`Updating Queue...`);
    console.log(res);

    const queueCont = document.getElementById("queue-container");
    queueCont.innerHTML = "";

    if(res == null){
        queueCont.innerHTML = "There are no upcoming songs";
        queueCont.classList.add("empty");
        return;
    }else{
        queueCont.classList.remove("empty");
    }

    for(let i of res){
        const inner = `
        <span>
            <span>${i.title}</span>
            <span>${i.author}</span>
        </span>
        <span>
            <span>${i.requestedBy.username}</span>
            <span>${i.duration}</span>
        </span>`;

        const queueItem = document.createElement("div");
        queueItem.classList.add("queue_item");
        queueItem.innerHTML = inner;

        queueCont.append(queueItem);
    }
}

function recCurrentSong(res){
    console.log(`Updating Current Song`);
    console.log(res);

    if(res === null || res == undefined){
        res = {
            title: "There are no songs being played",
            author: "",
            requestedBy: {
                username: "Try adding some on discord or here (future update)"
            },
            isPlaying: false,
            duration: "4:20",
            durationMS: 260000,
            progress: 0,
            currentSong: 0,
            repeatType: 0
        }
    }

    // For Updating Player Details
    document.getElementById("import_cTitle").innerHTML = res.title;
    document.getElementById("import_cAuthor").innerHTML = res.author;
    document.getElementById("import_cRequestor").innerHTML = res.requestedBy.username;
    document.getElementById("import_cDuration").innerHTML = res.duration;

    cSongDuration = res.durationMS;

    // For updating Loop State
    switch(res.repeatMode){
        case 0:
            document.getElementById("l_noRepeat").click();
            break;
        case 1:
            document.getElementById("l_trackRepeat").click();
            break;
        case 2:
            document.getElementById("l_queueRepeat").click();
            break;
    }

    // Toggling stateToggler Symbol
    if(res.isPlaying){
        stateToggler.innerHTML = "||";
        stateToggler.classList.add("paused");
    }else{
        stateToggler.innerHTML = "▶";
        stateToggler.classList.remove("paused");
    }

    // Pause / Resume Slider Interval
    if(res.isPlaying){
        startRangeAnimation(res.progress, res.durationMS);
    }else{
        clearInterval(progressInterval);
    }
}

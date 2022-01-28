function requestData(){
    console.clear();

    // request for Data
    socket.emit("getData", guildID);
}

function recData(res){
    console.log(`Updating Player`);
    console.log(res);

    const queueCont = document.getElementById("queue-container");
    queueCont.innerHTML = "";
    queueCont.classList.remove("empty");

    if(res == null){
        // display("Error: this link seems to be outdated or modified. GUILD_ID no match. If I am wrong then try to refresh");
        // socket.disconnect();

        queueCont.innerHTML = "There are no upcoming songs";
        queueCont.classList.add("empty");

        document.getElementById("import_cTitle").innerHTML = "There are current no songs being played";
        document.getElementById("import_cAuthor").innerHTML = "";
        document.getElementById("import_cRequestor").innerHTML = "Try adding one on discord or in here";
        document.getElementById("import_cDuration").innerHTML = 0;
        return;
    }

    // Guild Name Update
    guildName = res.guildName;
    document.getElementById("import_guildName").innerHTML = guildName;

    // Queue Update
    for(let i of res.tracks){
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

    // Player Details Update
    document.getElementById("import_cTitle").innerHTML = res.current.title;
    document.getElementById("import_cAuthor").innerHTML = res.current.author;
    document.getElementById("import_cRequestor").innerHTML = res.current.requestedBy;
    document.getElementById("import_cDuration").innerHTML = res.current.duration;
    
    cSongDuration = res.current.durationMS;

    // Loop State Update
    switch(res.repeatMode){
        case 0:
            document.getElementById("l_noRepeat").checked = true;
            break;
        case 1:
            document.getElementById("l_trackRepeat").checked = true;
            break;
        case 2:
            document.getElementById("l_queueRepeat").checked = true;
            break;
    }

    // Pause / Resume & Slider Interval
    if(res.playing){
        stateToggler.inner = "||";
        stateToggler.classList.add("paused");
        startRangeAnimation(res.current.progress, res.current.durationMS);
    }else{
        stateToggler.innerHTML = "▶";
        stateToggler.classList.remove("paused");
        clearInterval(progressInterval);
    }
}


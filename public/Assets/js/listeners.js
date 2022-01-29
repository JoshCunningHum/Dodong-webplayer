const { del } = require("express/lib/application");

function requestData(){
    console.clear();

    // request for Data
    socket.emit("getData", guildID);
}

function recData(res){
    console.log(`Updating Player`);
    console.log(res);

    // Default : If there are no next tracks
    const queueCont = document.getElementById("queue-container");
    queueCont.innerHTML = "";
    queueCont.classList.remove("empty");

    // If no guild is found, it receives an undefined data
    if(res == null){
        display("Error: this link seems to be outdated or modified. GUILD_ID no match. If I am wrong then try to refresh");
        socket.disconnect();

        return;
    }

    // Guild Name Update
    guildName = res.guildName;
    document.getElementById("import_guildName").innerHTML = guildName;

    // If no queue is found
    if(!res.current){
        queueCont.innerHTML = "There are no upcoming songs";
        queueCont.classList.add("empty");

        document.getElementById("import_cTitle").innerHTML = "There are current no songs being played";
        document.getElementById("import_cAuthor").innerHTML = "";
        document.getElementById("import_cRequestor").innerHTML = "Try adding one on discord or in here";
        document.getElementById("import_cDuration").innerHTML = 0;

        return;
    }

    // Queue Update
    for(let i of res.tracks){
        const inner = `<div>
            <span>
                <span>${i.title}</span>
                <span>${i.author}</span>
            </span>
            <span>
                <span>${i.requestedBy.username}</span>
                <span>${i.duration}</span>
            </span>
        </div>`;

        const queueItem = document.createElement("div");
        queueItem.classList.add("queue_item");
        queueItem.innerHTML = inner;

        const delBtn = document.createElement("btn");
        delBtn.innerHTML = "🗑";
        delBtn.classList.add("delTrack");
        delBtn.addEventListener("click", function(){
            deleteTrack(this);
        });

        queueItem.append(delBtn);
        queueCont.append(queueItem);
    }

    // Player Details Update
    document.getElementById("import_cTitle").innerHTML = res.current.title;
    document.getElementById("import_cAuthor").innerHTML = res.current.author;
    document.getElementById("import_cRequestor").innerHTML = res.current.requestedBy;
    document.getElementById("import_cDuration").innerHTML = res.current.duration;
    
    // Global Variables
    cSongDuration = res.current.durationMS;
    inVoiceChannel = res.inVoiceChannel;

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

function displayError(err){
    alert(err);
}


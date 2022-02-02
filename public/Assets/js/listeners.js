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
    document.getElementById("import_guildName").innerHTML = res.guildName;

    // Saves the guild for later use (Login page)
    if(guildID && res.guildName && res.guildName != "Guild Sample"){
        let savedGuilds = JSON.parse(localStorage.getItem("savedGuilds"));
        if(savedGuilds != null && savedGuilds != undefined){
            let guildFound = false;
            for(let i of savedGuilds){
                if(i.id == guildID){
                    // always set the name incase of an update
                    i.name = res.guildName;
                    guildFound = true;
                    break;
                }
            }
            if(!guildFound){
                savedGuilds.push({
                    id: guildID,
                    name: res.guildName
                });
                localStorage.setItem("savedGuilds",JSON.stringify(savedGuilds));
                updateGuildSelect();
            }
        }else{
            savedGuilds = [];
            savedGuilds.push({
                id: guildID,
                name: res.guildName
            });
            localStorage.setItem("savedGuilds",JSON.stringify(savedGuilds));
            updateGuildSelect();
        }
    }

    // If no queue is found
    if(!res.current){
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
    for(let i of res.tracks){
        const inner = `<div>
            <div data-value-id="order">${trackCount+1}</div>
            <div data-value-id="title">${i.title}</div>
            <div data-value-id="author">${i.author}</div>
            <div data-value-id="requestor">${i.requestedBy.username}</div>
            <div data-value-id="duration">${i.duration}</div>
        </div>`;

        const queueItem = document.createElement("div");
        queueItem.classList.add("queue_item");
        queueItem.innerHTML = inner;
        queueCont.dataset.index = trackCount;

        const delBtn = document.createElement("btn");
        delBtn.innerHTML = "🗑";
        delBtn.classList.add("delTrack");
        delBtn.addEventListener("click", function(){
            deleteTrack(this);
        });

        queueItem.append(delBtn);
        queueCont.append(queueItem);

        trackCount++;
    }

    // Player Details Update
    document.getElementById("import_cTitle").innerHTML = res.current.title;
    document.getElementById("import_cAuthor").innerHTML = res.current.author;
    document.getElementById("import_cRequestor").innerHTML = res.current.requestedBy;
    document.getElementById("import_cDuration").innerHTML = res.current.duration;
    seekRange.dataset.max = Math.floor(res.current.durationMS / 1000);
    
    // Global Variables
    cSongDuration = res.current.durationMS;
    inVoiceChannel = res.inVoiceChannel;

    // Loop State Update

    // Pause / Resume & Slider Interval
    if(res.playing){
        stateToggler.innerHTML = pauseSVG;
        stateToggler.dataset.state = "play";
        stateToggler.classList.add("paused");
        startRangeAnimation(res.current.progress, res.current.durationMS);
    }else{
        stateToggler.innerHTML = playSVG;
        stateToggler.dataset.state = "pause";
        stateToggler.classList.remove("paused");
        clearInterval(progressInterval);
    }
}

function displayError(err){
    switch(err.type){
        case "NO_GUILD":
            changePage("login");
            disableNav();
            if(!socket.connected) return;
            removeGuildonLocal(err.guildID);
            console.log(`GUILD_ID: ${err.guildID} not found on discord bot`);
            break;
    }
}


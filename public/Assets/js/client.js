const socket = io.connect(discordBotUrl, {
    reconnection: false,
    secure: true
});

// Global Variables

var guildID; // This is the guildID for arcaneWars
var queue, guildName, currentSong, progressInterval, localProgress, cSongDuration;

const stateToggler = document.getElementById('playpauseButton');
const nextButton = document.getElementById("nextButton");
const seekRange = document.getElementById("seekRange");

// DOM Event Listeners

stateToggler.addEventListener("click", e => {
    if(e.target.innerHTML == "||"){
        e.target.innerHTML = "▶";
        e.target.classList.remove("paused");
        socket.emit('pause', guildID);
        clearInterval(progressInterval);
    }else{
        e.target.innerHTML = "||";
        e.target.classList.add("paused");
        socket.emit('resume', guildID);
        startRangeAnimation(localProgress*1000, cSongDuration);
    }
})

nextButton.addEventListener("click", e => {
    socket.emit("skip", guildID);
})

/* Seeker Update Here */

document.querySelectorAll('input[name="repeatState"]').forEach(el => {
    el.addEventListener('click', function(){
        let repeatType;

        switch(this.id){
            case "l_noRepeat":
                repeatType = 0;
                break;
            case "l_queueRepeat":
                repeatType = 2;
                break;
            case "l_trackRepeat":
                repeatType = 1;
                break;
        }

        socket.emit("loop", {
            guild: guildID,
            repeatType: repeatType
        });
    });
})


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

        // // Request for queue
        // socket.emit('getQueue', guildID);

        // // Request for current song
        // socket.emit('getCurrentSong', guildID);
    }, 1000);
}

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

function startRangeAnimation(progress, duration){

    localProgress = Math.ceil(progress / 1000);
    duration = duration / 1000;
    clearInterval(progressInterval);

    progressInterval = setInterval((duration) => {
        const progCont = document.getElementById("import_cProgress");
        const slider = document.getElementById("seek-range");
        let progPercent = (localProgress / duration) * 100;
        let minProg = Math.floor(localProgress / 60);
        let secProg = localProgress - (minProg * 60);

        slider.value = progPercent;
        progCont.innerHTML = `${minProg}:${padd(secProg, 2)}`;

        if(progPercent >= 99.99){
            clearInterval(progressInterval);
        }

        localProgress++;

    }, 1000, duration);
}

function changeConnectStatus(status){
    const target = document.getElementById("connectionStatus");

    if(status){
        target.innerHTML = "Connected";
        target.style.background = "var(--dodong-secondary)";
    }else{
        // Disconnected State

        target.innerHTML = "Not Connected";
        target.style.background = "var(--dodong-primary)";
        clearInterval(progressInterval);
    }
}

function display(text){
    document.write(text);
}

function padd(integer, n){
    let diff = n - String(integer).length;
    if(diff > 0){
        integer = "0".repeat(diff) + integer;
    }
    return integer;
}
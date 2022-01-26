const socket = io(discordBotUrl, {
    reconnection: false
});

const stateToggler = document.getElementById('playpauseButton');
const nextButton = document.getElementById("nextButton");
const seekRange = document.getElementById("seekRange");

stateToggler.addEventListener("click", e => {
    if(e.target.innerHTML == "||"){
        e.target.innerHTML = "▶";
        e.target.classList.remove("paused");
        socket.emit('pause', guildID);
    }else{
        e.target.innerHTML = "||";
        e.target.classList.add("paused");
        socket.emit('resume', guildID);
    }
})

nextButton.addEventListener("click", e => {
    socket.emit("skip", guildID);
})

/* Seeker Update Here */

var guildID; // This is the guildID for arcaneWars
var queue, guildName, currentSong, progressInterval, localProgress;

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
            progress: 0
        }
    }

    document.getElementById("import_cTitle").innerHTML = res.title;
    document.getElementById("import_cAuthor").innerHTML = res.author;
    document.getElementById("import_cRequestor").innerHTML = res.requestedBy.username;
    document.getElementById("import_cDuration").inner = res.duration;

    if(res.isPlaying){
        stateToggler.innerHTML = "||";
        stateToggler.classList.add("paused");
    }else{
        stateToggler.innerHTML = "▶";
        stateToggler.classList.remove("paused");
    }

    startRangeAnimation(res.progress, res.durationMS);
}

function startRangeAnimation(progress, duration){

    localProgress = progress / 1000;
    duration = duration / 1000;
    clearInterval(progressInterval);

    progressInterval = setInterval((duration) => {
        const progCont = document.getElementById("import_cProgress");
        const slider = document.getElementById("seek-range");
        const progPercent = (localProgress / duration) * 100;
        const minProg = Math.floor(progress / 60);
        const secProg = localProgress - (minProg * 60);

        slider.value = progPercent;
        progCont.innerHTML = `${minProg}:${padd(secProg, 2)}`;

        if(progPercent > 97){
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
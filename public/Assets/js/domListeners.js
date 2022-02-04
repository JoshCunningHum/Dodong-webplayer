// DOM Event Listeners

// Play / Pause Button
stateToggler.addEventListener("click", function() {
    if (this.dataset.state == "play") {
        this.innerHTML = playSVG;
        this.classList.remove("paused");
        this.dataset.state = "pause";
        discordPlayerControl("pause");
        clearInterval(progressInterval);
    } else {
        this.dataset.state = "play";
        this.innerHTML = pauseSVG;
        this.classList.add("paused");
        discordPlayerControl("resume");
        startRangeAnimation(localProgress * 1000, cSongDuration);
    }
})


// Next Button
nextButton.addEventListener("click", e => {
    discordPlayerControl("skip");
})

// Disabled for now since it is laggy
// Seek
// seekRange.addEventListener("change", function(){
//     discordPlayerControl("seek", {
//         prog: this.value
//     })
// })


// Tab Change
Array.from(document.querySelectorAll(".navBtn")).forEach(el => {
    el.addEventListener("click", function () {
        if (this.classList.contains('selected')) {
            return;
        }
        changePage(this.dataset.target);
    });
})
/*
// Play / Add Song Feature
document.querySelector("#add_song > input").addEventListener("change", function () {
    let query = this.value;
    if (!query || query.length == 0) {
        alert("Please Type Something");
        return;
    }

    if (!inVoiceChannel) {
        alert("The bot is not in a voice channel");
        return;
    }

    socket.emit("play", {
        guild: guildID,
        query: query,
        voiceChannelID: inVoiceChannel
    });

    this.value = "";

});*/

// Removes songs
function deleteTrack(btn) {
    let trackIndex = Array.from(document.getElementById("queue-container").children).indexOf(btn.parentElement);

    discordPlayerControl("remove", {
        trackIndex: trackIndex
    })
};

// Login Button
document.getElementById("loginGuildBtn").addEventListener("click", function () {
    const guildInput = document.getElementById("login_guildInput").value;
    const guildSelect = this.parentElement.querySelector("select.monospace").value;

    if(guildSelect == 0 && guildInput.length == 0){
        alert("Enter a GUILD_ID or Choose from the saved GUILD IDs if available");
        return;
    }

    const currentURL = window.location.href.split("?")[0];

    

    if (guildSelect != 0) { // if guild selected is not 0 then choose guildSelect
        window.location.replace(`${currentURL}?guildID=${guildSelect}`);
    } else { // choose the inputted one instead
        window.location.replace(`${currentURL}?guildID=${guildInput}`);
    }
})

// Guild Input Automatic Login
document.getElementById("login_guildInput").addEventListener("change", function () {
    const guildSelect = this.parentElement.querySelector("select.monospace");
    selectItem(guildSelect, 0);
    document.getElementById("loginGuildBtn").click();
});

// Search and Lyrics Expand
document.getElementById("SLexpandBtn").addEventListener("click", function() {
    const SLCont = document.getElementById("SLcont");
    if(SLCont.classList.contains("expanded")){
        SLCont.classList.remove("expanded");
        this.classList.remove("expanded");
    }else{
        SLCont.classList.add("expanded");
        this.classList.add("expanded");
    }
});

// Search Button
document.getElementById("searchButton").addEventListener("click", async function() {
    const query = document.getElementById("searchQuery").value;
    if(!query || query.length == 0) return;
    if (!inVoiceChannel) {
        alert("The bot is not in a voice channel");
        return;
    }

    /* todo:
        if query is already a youtube/spotify/soundcloud URL,
        we should skip this and just emit the play event for socket
    */
    const results = await getSearchResults(query);
    let resultList = "";
    for(let i = 0; i < results.length; i++) {
        resultList = resultList.concat(
            `<div class="searchResult">
                <a href="https://youtu.be/${results[i].id}">${results[i].title}</a>
                <button class="addResult" value="${results[i].id}">+</button>
             </div>` // results[i].thumbnail.url for the thumbnail image, in case u wanna show it too
            );
    }
    // set results limit to 10 instead of 5?
    // cos 5 seems too low for the large SLResults div
    document.getElementById("SLResults").innerHTML = resultList;
    document.getElementById("searchQuery").value = "";

    document.querySelectorAll(".addResult").forEach(b => b.addEventListener('click', async function () {
        //console.log(`addResult clicked: https://youtu.be/${b.value}`); // for debugging
        socket.emit("play", {
            guild: guildID,
            query: `https://youtu.be/${b.value}`,
            voiceChannelID: inVoiceChannel
        });
    }));
});

// Lyrics Button
document.getElementById("lyricsButton").addEventListener("click", async function() {
    const query = document.getElementById("searchQuery").value;
    if(!query || query.length == 0) return;
    const results = await getSearchResults(query, true);
    document.getElementById("SLResults").innerText = results;
    document.getElementById("searchQuery").value = "";
});

// When Browser Resizes
$(window).resize(function(){

    // All Fixed Heights
    setFixedHeights();
});

// Repeat Button
document.getElementById("repeatBtn").addEventListener("click", function(){
    switch(this.dataset.state){
        case "no-repeat":
            console.log("yep");
            this.dataset.state = "queue-repeat";
            this.classList.add("active");
            break;
        case "queue-repeat":
            this.dataset.state = "track-repeat";
            this.classList.add("active");
            this.innerHTML = repTSVG;
            break;
        case "track-repeat":
            this.dataset.state = "no-repeat";
            this.classList.remove("active");
            this.innerHTML = repQSVG;
            break;
    }
});

// Event Chain for the Volume Slider
document.getElementById("volume-slider").addEventListener("mousedown", function(e){
    this.dataset.activeDrag = true;
    this.dataset.downCoord = e.clientX;
    this.classList.add("isChanging");
    _volSlide(this, e);
})

document.getElementById("player-container").addEventListener("mousemove", function(e){
    const volumeSlider = document.getElementById("volume-slider");
    if(volumeSlider.dataset.activeDrag == "true") _volSlide(volumeSlider, e);
})

function _volSlide(el, e){
    const coordDiff = e.clientX - parseFloat(el.dataset.downCoord);
    const remPart = parseFloat(el.dataset.downCoord) - el.getBoundingClientRect().left;
    let CRD = (remPart + coordDiff) / el.getBoundingClientRect().width;

    if(CRD < 0){
        CRD = 0;
    }else if(CRD > 1){
        CRD = 1;
    }

    const hider = el.children[0];

    hider.style.width = `${(100 * (1 - CRD)).toFixed()}%`;
    el.dataset.tooltip = `${(100 * CRD).toFixed()}%`;
}

document.getElementById("player-container").addEventListener("mouseup", function(){

    // Volume Slider
    const volumeSlider = document.getElementById("volume-slider");
    volumeSlider.classList.remove("isChanging");
    volumeSlider.dataset.activeDrag = "false";

    // Do the Volume Update
})
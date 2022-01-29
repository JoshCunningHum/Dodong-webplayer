
// DOM Event Listeners

// Play / Pause Button
stateToggler.addEventListener("click", e => {
    if(e.target.innerHTML == "||"){
        e.target.innerHTML = "▶";
        e.target.classList.remove("paused");
        discordPlayerControl("pause");
        clearInterval(progressInterval);
    }else{
        e.target.innerHTML = "||";
        e.target.classList.add("paused");
        discordPlayerControl("play");
        startRangeAnimation(localProgress*1000, cSongDuration);
    }
})


// Next Button
nextButton.addEventListener("click", e => {
    discordPlayerControl("skip");
})

/* Seeker Update Here */

// Loop State Change
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

        discordPlayerControl("loop", {
            repeatType: repeatType
        })
    });
})

// Tab Change
Array.from(document.getElementById("navCont").children).forEach(el => {
    el.addEventListener("click", function() {
        if(this.classList.contains('selected')){
            return;
        }

        const siblings = Array.from(this.parentElement.querySelectorAll(":scope > button"));
        siblings.forEach(el => el.classList.remove('selected'));

        this.classList.add("selected");
        const thisIndex = siblings.indexOf(this);

        changePage(thisIndex);
    });
})

 // Play Feature
 document.querySelector("#add_song > input").addEventListener("change", function(){
    let query = this.value;
    if(!query || query.length == 0){
        alert("Please Type Something");
        return;
    }

    if(!inVoiceChannel){
        alert("The bot is not in a voice channel");
        return;
    }

    socket.emit("play", {
        guild: guildID,
        query: query,
        voiceChannelID: inVoiceChannel
    });

    this.value = "";

 });

 // Removes songs
 function deleteTrack(btn){
    let trackIndex = Array.from(document.getElementById("queue-container").children).indexOf(btn.parentElement);

    discordPlayerControl("remove", {
        trackIndex: trackIndex
    })
 };
 
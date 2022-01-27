
// DOM Event Listeners

// Play / Pause Button
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


// Next Button
nextButton.addEventListener("click", e => {
    socket.emit("skip", guildID);
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

        socket.emit("loop", {
            guild: guildID,
            repeatType: repeatType
        });
    });
})

Array.from(document.getElementById("navCont").children).forEach(el => {
    el.addEventListener("click", function() {
        if(this.classList.contains('selected')){
            return;
        }

        const siblings = Array.from(this.parentElement.querySelectorAll(":scope > button"));
        siblings.forEach(el => el.classList.remove('selected'));

        this.classList.add("selected");
        const thisIndex = siblings.indexOf(this);

        const pageCont = document.getElementById("pageCont");
        const pages = Array.from(pageCont.children);
        pages.forEach((page, i) => {
            if(i != thisIndex){
                page.classList.add("sr-only");
            }else{
                page.classList.remove("sr-only");
            }
        })

    });
})

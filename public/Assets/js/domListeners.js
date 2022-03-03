"use strict";

// DOM Event Listeners

// Play / Pause Button
stateToggler.addEventListener("click", function () {
    if(isOnCooldown("click")) return;
    if (this.dataset.state == "play") {
        this.innerHTML = playSVG;
        this.classList.remove("paused");
        this.dataset.state = "pause";
        discordPlayerControl("pause", {}, false);
        clearInterval(progressInterval);
    } else {
        this.dataset.state = "play";
        this.innerHTML = pauseSVG;
        this.classList.add("paused");
        discordPlayerControl("resume", {}, false);
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

    if (guildSelect == 0 && guildInput.length == 0) {
        display("Enter a GUILD_ID or Choose from the available GUILD IDs");
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
document.getElementById("SLexpandBtn").addEventListener("click", function () {
    const SLCont = document.getElementById("SLcont");
    if (SLCont.classList.contains("expanded")) {
        SLCont.classList.remove("expanded");
        this.classList.remove("expanded");
    } else {
        SLCont.classList.add("expanded");
        this.classList.add("expanded");
    }
});

// Search Button
document.getElementById("searchButton").addEventListener("click", async function () {
    const query = document.getElementById("searchQuery").value;
    if (!query || query.length == 0) return;
    if (!inVoiceChannel) {
        display("The bot is not in a voice channel");
        return;
    }

    // If query is a valid URL
    if (isValidURL(query)) {

        discordPlayerControl("play", {
            query: query,
            voiceChannelID: inVoiceChannel
        })
        return;
    }

    const results = await getSearchResults(query);
    let resultList = "";
    for (let i = 0; i < results.length; i++) {
        resultList = resultList.concat(
            `<div class="searchResult">
                <img src="${results[i].thumbnail.url}">
                <a href="https://youtu.be/${results[i].id}">${results[i].title}</a>
                <button class="addResult" value="${results[i].id}">➕</button>
             </div>` 
        );
    }
    // set results limit to 10 instead of 5?
    // cos 5 seems too low for the large SLResults div

    // yes
    document.getElementById("SLResults").innerHTML = resultList;

    document.querySelectorAll(".addResult").forEach(b => b.addEventListener('click', async function () {
        //console.log(`addResult clicked: https://youtu.be/${b.value}`); // for debugging
        discordPlayerControl("play", {
            query: `https://youtu.be/${b.value}`,
            voiceChannelID: inVoiceChannel
        });
    }));
});

// Lyrics Button
document.getElementById("lyricsButton").addEventListener("click", async function () {
    const query = document.getElementById("searchQuery").value;
    if (!query || query.length == 0) return;
    let results = await getSearchResults(query, true);

    results = results.replace(/(\r\n|\r|\n)/g, `\n<br>`).replace(/\[/g, "[<strong>").replace(/\]/g, "</strong>]").replace(/\(/g, "(<em>").replace(/\)/g, "</em>)");

    document.getElementById("SLResults").innerHTML = results;
});

// When Browser Resizes
$(window).resize(function () {

    // All Fixed Heights
    setFixedHeights();

    // Cut long text in queue
    _cutLongTextInQueue();
});

// Repeat/Loop Button
document.getElementById("repeatBtn").addEventListener("click", function () {
    if(isOnCooldown("loop")) return;
    switch (this.dataset.state) {
        case "0":
            this.dataset.state = "2";
            this.classList.add("active");
            break;
        case "2":
            this.dataset.state = "1";
            this.classList.add("active");
            this.innerHTML = repTSVG;
            break;
        case "1":
            this.dataset.state = "0";
            this.classList.remove("active");
            this.innerHTML = repQSVG;
            break;
    }
    discordPlayerControl("loop", {
        repeatType: parseInt(this.dataset.state)
    }, false);
});

// --- Event Chain for the Volume Slider ---
document.getElementById("volume-slider").addEventListener("mousedown", function (e) {
    this.dataset.activeDrag = true;
    this.dataset.downCoord = e.clientX;
    this.classList.add("isChanging");
    _volSlide(this, e);
})

document.getElementById("player-container").addEventListener("mousemove", function (e) {
    const volumeSlider = document.getElementById("volume-slider");
    if (volumeSlider.dataset.activeDrag == "true") _volSlide(volumeSlider, e);
})

function _volSlide(el, e) {
    let CRD;

    if (typeof e == "number") {
        CRD = e / 100;
    } else {
        const coordDiff = e.clientX - parseFloat(el.dataset.downCoord);
        const remPart = parseFloat(el.dataset.downCoord) - el.getBoundingClientRect().left;

        CRD = (remPart + coordDiff) / el.getBoundingClientRect().width;
    }

    if (CRD < 0) {
        CRD = 0;
    } else if (CRD > 1) {
        CRD = 1;
    }

    const hider = el.children[0];

    hider.style.width = `${(100 * (1 - CRD)).toFixed()}%`;
    el.dataset.vol = parseInt(100 * CRD);
    el.dataset.tooltip = `${el.dataset.vol}%`;
}

document.getElementById("player-container").addEventListener("mouseup", _volUpdate)

document.getElementById("player-container").addEventListener("mouseleave", _volUpdate);

function _volUpdate(){
    const volumeSlider = document.getElementById("volume-slider");
    if(!volumeSlider.classList.contains("isChanging")) return;
    volumeSlider.classList.remove("isChanging");
    volumeSlider.dataset.activeDrag = "false";

    discordPlayerControl("volume", {
        volume: parseInt(volumeSlider.dataset.tooltip)
    });
}
// --- Event Chain for the Volume Slider ---

// Move Feature
function _moveUpdate() {
    const queueCont = document.getElementById("queue-container");
    const qChildren = queueCont.querySelectorAll(":scope > div[data-index]");
    const finalOrder = Array.from(qChildren).map(e => parseInt(e.dataset.index));
    let iniOrder = [];

    for (let i = 0; i < qChildren.length; i++) iniOrder.push(i);

    const argPos = getNewPositions(iniOrder, finalOrder);
    if(argPos == null) return;

    Array.from(qChildren).forEach((e, i) => {
        e.dataset.index = iniOrder[i];
        e.querySelector(`:scope [data-value-id="order"]`).innerText = i + 1;
    });

    discordPlayerControl("move", {
        initialPos: argPos[0],
        finalPos: argPos[1]
    });
}

// Shuffle Btn
document.getElementById("shuffleBtn").addEventListener("click", function () {
    discordPlayerControl("shuffle");
})
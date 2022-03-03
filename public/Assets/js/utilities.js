"use strict";

function display(text) {
    const infoModal = document.querySelector("#infoM");

    infoModal.querySelector("#infoM-Text").innerText = text;

    changePage("infoM");
}

function padd(integer, n) {
    let diff = n - String(integer).length;
    if (diff > 0) integer = "0".repeat(diff) + integer;
    return integer;
}

function startRangeAnimation(progress, duration) {

    localProgress = Math.ceil(progress / 1000);
    duration = duration / 1000;
    clearInterval(progressInterval);

    progressInterval = setInterval((duration) => {
        const progCont = document.getElementById("import_cProgress");
        const slider = seekRange.children[0];
        let minProg = Math.floor(localProgress / 60);
        let secProg = localProgress - (minProg * 60);

        slider.style.width = (localProgress / duration) * 100 + "%";
        progCont.innerHTML = `${minProg}:${padd(secProg, 2)}`;

        if (localProgress >= duration - 1) { // Stop the animation 1 second before finish
            clearInterval(progressInterval);
        }

        localProgress++;

    }, 1000, duration);
}

function changeConnectStatus(status) {
    const target = document.getElementById("connectionStatus");

    // Will only do an update if the state changed
    if (status && target.innerHTML != "Connected") {
        target.classList.remove("slideUp");
        target.innerHTML = "Connected";
        target.style.background = "var(--dodong-secondary)";
        setTimeout(() => {
            target.classList.add("slideUp")
        }, 1000);
    } else if (!status && target.innerHTML != "Not Connected") {
        target.classList.remove("slideUp");
        target.innerHTML = "Not Connected";
        target.style.background = "var(--dodong-primary)";
    }
}

function changePage(id) {
    const pages = Array.from(document.getElementById("MODAL").children);
    pages.forEach((page) => {
        if (page.id != id) {
            page.classList.add("sr-only");
        } else {
            page.classList.remove("sr-only");
        }
    });
}

function discordPlayerControl(control_type, args = {}, cdCheck = true) {
    if(cdCheck && isOnCooldown(`playerControl - ${control_type}`)) return;

    args.guild = guildID;
    args.type = control_type;
    if(control_type == "play") socket.emit('play', args);
    else socket.emit('controlSignal', args);
}

function disableNav(state = true) {
    $(".navBtn").each((i, el) => {
        $(el).attr("disabled", state);
    })
}

function selectItem(select, value) {
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value == value) {
            select.selectedIndex = i;
            break;
        }
    }
}

function updateGuildSelect() {
    if (availableGuilds != null && availableGuilds != undefined) {
        const guildSelect = document.querySelector("#login > fieldset > select.monospace");
        guildSelect.innerHTML = "";
        $(guildSelect).append(`<option value="0">Choose a guild</option>`);
        for (let i of availableGuilds) {
            $(guildSelect).append(`<option value="${i.id}">${i.name}</option>`);
        }
        $(guildSelect).attr("disabled", false);
    }
}

async function askBotURL() {
    let response = await fetch('/botURL', {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer'
    })
    discordBotUrl = await response.json();
}

async function getSearchResults(query, lyrics = false) {
    let response = await fetch(lyrics ? `/lyrics` : `/search`, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            query: query
        })
    });

    return await response.json();
};

function setFixedHeights() {
    const toBeFixed = Array.from(document.getElementsByClassName("fixedHeight"), el => [el, el.dataset.target]);
    for (let el of toBeFixed) {
        let basedHeight;
        if (el[1] == "$Parent$") {
            basedHeight = el[0].parentElement.clientHeight;
        } else {
            basedHeight = document.querySelector(el[0]).clientHeight;
        }
        el[0].height = basedHeight;
    }
}

/*
    Before: [0, 1, 2, 3, 4, 5] 
    After: [0, 4, 1, 2, 3, 5] 
    Returns: [4, 1] - The value at index 4 is moved to index 1
*/

function getNewPositions(arrBefore, arrAfter) {
    if (arrBefore.length != arrAfter.length) return;

    let iniPos, finalPos = arrBefore.length - 1,
        valB, valF;
    for (let i = 0; i < arrBefore.length; i++) {
        [valB, valF] = [arrBefore[i], arrAfter[i]];

        if (iniPos == undefined) {
            if (valB != valF) iniPos = i;
        } else {
            if (valB == valF) {
                finalPos = i - 1;
                break;
            }
        }
    }

    if (iniPos == undefined) return null;
    if (arrBefore[iniPos] != arrAfter[finalPos])[iniPos, finalPos] = [finalPos, iniPos];


    return [iniPos, finalPos];
}

// Straight from stackoverflow
function isValidURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

// Checks if the total width of a string overflows with the width
function isTooLong(text, el){
    const textWidth = getTextWidth(text, getCanvasFontSize(el));
    const elWidth = el.clientWidth;

    return textWidth > elWidth;
}

function getTextWidth(text, font) {
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}

function getCssStyle(element, prop) {
    return window.getComputedStyle(element, null).getPropertyValue(prop);
}

function getCanvasFontSize(el = document.body) {
    const fontWeight = getCssStyle(el, 'font-weight') || 'normal';
    const fontSize = getCssStyle(el, 'font-size') || '16px';
    const fontFamily = getCssStyle(el, 'font-family') || 'Times New Roman';

    return `${fontWeight} ${fontSize} ${fontFamily}`;
}

function _cutLongTextInQueue(){
    const queueCont = document.querySelector("#queue-container");
    const queueItems = queueCont.querySelectorAll(":scope > div[data-index]");

    queueItems.forEach( (queueItem) => {
        ["title", "author", "requestor", "duration"].forEach( (e) => {
            const queueValue = queueItem.querySelector(`[data-value-id="${e}"]`);
            if(isTooLong(queueValue.innerText, queueValue)){
                queueValue.classList.add("tooLong");
            }else{
                queueValue.classList.remove("tooLong");
            }
        });
    })
    
}

function isOnCooldown(from){
    let date = new Date();
    let current = date.getTime();

    // console.log("Call from: " + from); // For dev purposes

    if(current - lastReq < coolDownDelay){
        display("Woah Slowdown, still on cooldown");
        return true;
    }

    lastReq = current;
    return false;
}
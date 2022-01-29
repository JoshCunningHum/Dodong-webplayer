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

function startRangeAnimation(progress, duration){

    localProgress = Math.ceil(progress / 1000);
    duration = duration / 1000;
    clearInterval(progressInterval);

    progressInterval = setInterval((duration) => {
        const progCont = document.getElementById("import_cProgress");
        const slider = document.getElementById("seek-range");
        let minProg = Math.floor(localProgress / 60);
        let secProg = localProgress - (minProg * 60);

        slider.setAttribute("value", localProgress);
        slider.value = localProgress;
        progCont.innerHTML = `${minProg}:${padd(secProg, 2)}`;

        if(localProgress >= duration - 2){ // Stop the animation 2 seconds before finish
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

function changePage(index){
    const pages = Array.from(document.getElementById("pageCont").children);
    pages.forEach((page, i) => {
        if(i != index){
            page.classList.add("sr-only");
        }else{
            page.classList.remove("sr-only");
        }
    })
}

function discordPlayerControl(control_type, args = {}){
    args.guild = guildID;
    args.type = control_type;
    socket.emit('controlSignal', args);
}
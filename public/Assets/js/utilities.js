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
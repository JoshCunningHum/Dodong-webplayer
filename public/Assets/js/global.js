"use strict";

// Global Variables
const urlParams = new URLSearchParams(window.location.search);

const guildID = urlParams.get("guildID"); // IMPORTANT. found at query parameter


var socket, // IMPORTANT
    progressInterval, // For the progress animation
    lastReq = 0, // For cooldown
    localProgress, // For debugging purposes
    cSongDuration, // For debugging purposes
    inVoiceChannel, // For error handling
    availableGuilds = [], // contains objects of available guilds
    session; // session info, contains username, id, avatar, and guilds of user

const coolDownDelay = 1000; // in ms

const stateToggler = document.getElementById('playpauseButton');
const nextButton = document.getElementById("nextButton");
const seekRange = document.getElementById("seek-range");

// SVG Icons
const playSVG = `<svg class="fAwesome" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M176 480C148.6 480 128 457.6 128 432v-352c0-25.38 20.4-47.98 48.01-47.98c8.686 0 17.35 2.352 25.02 7.031l288 176C503.3 223.8 512 239.3 512 256s-8.703 32.23-22.97 40.95l-288 176C193.4 477.6 184.7 480 176 480z"></path></svg>`;
const pauseSVG = `<svg class="fAwesome" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M272 63.1l-32 0c-26.51 0-48 21.49-48 47.1v288c0 26.51 21.49 48 48 48L272 448c26.51 0 48-21.49 48-48v-288C320 85.49 298.5 63.1 272 63.1zM80 63.1l-32 0c-26.51 0-48 21.49-48 48v288C0 426.5 21.49 448 48 448l32 0c26.51 0 48-21.49 48-48v-288C128 85.49 106.5 63.1 80 63.1z"></path></svg>`;
const repQSVG = `<svg class="fAwesome" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M341.333333 853.333333v82.432a21.333333 21.333333 0 0 1-34.986666 16.426667l-175.786667-146.474667A21.333333 21.333333 0 0 1 144.298667 768H768a85.333333 85.333333 0 0 0 85.333333-85.333333V341.333333h85.333334v341.333334a170.666667 170.666667 0 0 1-170.666667 170.666666H341.333333z m341.333334-682.666666V88.234667a21.333333 21.333333 0 0 1 34.986666-16.426667l175.786667 146.474667a21.333333 21.333333 0 0 1-13.696 37.717333H256a85.333333 85.333333 0 0 0-85.333333 85.333333v341.333334H85.333333V341.333333a170.666667 170.666667 0 0 1 170.666667-170.666666h426.666667z"  /></svg>`;
const repTSVG = `<svg class="fAwesome" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M341.333333 853.333333v82.432a21.333333 21.333333 0 0 1-34.986666 16.426667l-175.786667-146.474667A21.333333 21.333333 0 0 1 144.298667 768H768a85.333333 85.333333 0 0 0 85.333333-85.333333V341.333333h85.333334v341.333334a170.666667 170.666667 0 0 1-170.666667 170.666666H341.333333z m341.333334-682.666666V88.234667a21.333333 21.333333 0 0 1 34.986666-16.426667l175.786667 146.474667a21.333333 21.333333 0 0 1-13.696 37.717333H256a85.333333 85.333333 0 0 0-85.333333 85.333333v341.333334H85.333333V341.333333a170.666667 170.666667 0 0 1 170.666667-170.666666h426.666667z m-213.333334 170.666666h85.333334v341.333334h-85.333334v-256H384V384l85.333333-42.666667z"  /></svg>`;
// Global Variables
const urlParams = new URLSearchParams(window.location.search);

const guildID = urlParams.get("guildID"); // IMPORTANT. found at query parameter


var discordBotUrl , // IMPORTANT
progressInterval, // For the progress animation
localProgress, // For debugging purposes
cSongDuration, // For debugging purposes
inVoiceChannel; // For error handling

const stateToggler = document.getElementById('playpauseButton');
const nextButton = document.getElementById("nextButton");
const seekRange = document.getElementById("seek-range");

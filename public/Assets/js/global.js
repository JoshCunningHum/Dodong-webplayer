// Global Variables

var guildID; // This is the guildID for arcaneWars
var queue, guildName, currentSong, progressInterval, localProgress, cSongDuration, inVoiceChannel, draggedTrack;

const stateToggler = document.getElementById('playpauseButton');
const nextButton = document.getElementById("nextButton");
const seekRange = document.getElementById("seek-range");
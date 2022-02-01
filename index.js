const express = require("express");
const app = express();
const config = require("./config.js");
require("dotenv").config();

// use the express-static middleware
app.use(express.static("public"))

// start the server listening for requests
app.listen(process.env.PORT || 8080, 
	() => console.log("Server is running..."));

app.post('/botURL', function (req, res){
	res.json(process.env.DISCORDBOTURL || config.discordBotUrl);
});
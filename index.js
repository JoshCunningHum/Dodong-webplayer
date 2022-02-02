const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const config = require("./config.js");
require("dotenv").config();

const Youtube = require("youtube-sr").default;

// use the express-static middleware
app.use(express.static("public"))

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// start the server listening for requests
app.listen(process.env.PORT || 8080, 
	() => console.log("Server is running..."));

// asks for bot URL
app.post('/botURL', function (req, res){
	res.json(process.env.DISCORDBOTURL || config.discordBotUrl);
});

// asks for YouTube Results
app.post('/search', function(req, res) {
	Youtube.search(req.body.query, {limit: 5, type: "video", safeSearch: true})
		.then(results => res.json(results))
		.catch(console.error);
})
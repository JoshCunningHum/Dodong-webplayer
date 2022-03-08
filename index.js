const express = require("express");
const session = require('express-session');
const app = express();
const config = require("./config.js");
const path = require('path');
require("dotenv").config();

const server = app.listen(process.env.PORT || 8080, () => console.log("Server is running."));;

const passport = require('passport');
require('./src/strategies/discord');

app.use(
	session({
		secret: 'meow meow', // todo: make this more secure
		resave: false,
		saveUninitialized: false,
		//cookie: { secure: true } // for https only

		// todo: use a different store
		// http://expressjs.com/en/resources/middleware/session.html#compatible-session-stores
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
	if(!req.session.passport) {
	// probably not the best way to check the session, ill try to improve this later
		console.log("---- Redirecting to auth.");
		res.redirect('/auth');
	} else {
		console.log("---- Serving static files.");
		res.sendFile("index.html", { root: path.join(__dirname, 'public') });
	}
});

// use the express-static middleware
app.use(express.static("public"))


// asks for bot URL
// Now returns where socket (as server) resides
app.post('/botURL', function (req, res){
	if(process.env.TEST) res.json('http://localhost:8080'); // For development purposes
	else res.json(process.env.THISURL || config.thisURL);
});

const search = require('./src/routes/search');
app.use('/search', search);

const lyrics = require('./src/routes/lyrics');
app.use('/lyrics', lyrics);

const auth = require('./src/routes/auth');
app.use('/auth', auth);

const sessionInfo = require('./src/routes/session');
app.use('/session', sessionInfo);

// Initiate socket connection
const Bot = require("./src/socket/client.js");
const botSocket = new Bot();
botSocket.init(server);
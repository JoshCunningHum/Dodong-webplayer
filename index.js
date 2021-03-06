const express = require("express");
const session = require('express-session');
const app = express();
const path = require('path');
require("dotenv").config();

const server = app.listen(process.env.PORT || 8080, () => console.log("Server is running."));;

const passport = require('passport');
require('./src/strategies/discord');

const sessionMiddleware = session({
	secret: 'meow meow', // todo: make this more secure
	resave: false,
	saveUninitialized: false,
	//cookie: { secure: true } // for https only

	// todo: use a different store
	// http://expressjs.com/en/resources/middleware/session.html#compatible-session-stores
});
app.use(sessionMiddleware);

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
botSocket.init(server, sessionMiddleware);
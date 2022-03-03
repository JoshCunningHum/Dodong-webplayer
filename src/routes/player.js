const { Router } = require('express');
const router = Router();
const config = require("../../config.js");
const io = require('socket-io')
const bodyParser = require("body-parser");

// body parser middleware
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// asks for Genius lyrics
router.post('/', async function (req, res) {
	


    res.json(lyrics);
});

module.exports = router;
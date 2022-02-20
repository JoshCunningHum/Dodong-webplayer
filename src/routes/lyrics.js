const { Router } = require('express');
const router = Router();
const config = require("../../config.js");
const Genius = require("genius-lyrics");
const Lyrics = new Genius.Client(process.env.GENIUSAPITOKEN || config.geniusApiToken);

const bodyParser = require("body-parser");

// body parser middleware
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// asks for Genius lyrics
router.post('/', async function (req, res) {
    const searches = await Lyrics.songs.search(req.body.query);
    const lyrics = await searches[0].lyrics();
    res.json(lyrics);
});

module.exports = router;
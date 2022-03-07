const { Router } = require('express');
const router = Router();
const Youtube = require("youtube-sr").default;

const bodyParser = require("body-parser");

// body parser middleware
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// asks for YouTube Results
router.post('/', function(req, res) {
	Youtube.search(req.body.query, {limit: 10, type: "video", safeSearch: true})
		.then(results => res.json(results))
		.catch(console.error);
});

module.exports = router;
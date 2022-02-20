const { Router } = require('express');
const router = Router();
const passport = require('passport');

router.get('/', passport.authenticate('discord'),
    (req, res) => {
        res.sendStatus(200);
    }
);

router.get('/redirect', passport.authenticate('discord'),
    (req, res) => {
        res.redirect('../../');
    }
);

module.exports = router;
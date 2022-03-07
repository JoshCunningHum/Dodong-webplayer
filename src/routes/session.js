const global = require('../global');
const { Router } = require('express');
const router = Router();

// get session info (user and guilds data)

router.post('/', async function(req, res) {
    if(req.session.passport) {
        try {
            const user = await global.users.find(users => users.id === req.session.passport.user);
            if (!user) throw new Error('User not found');
            res.json(user);
        } catch (error) {
            console.log(error);
            res.json({});
        }
    } else {
        res.json({});
    }
});

module.exports = router;
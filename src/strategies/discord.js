const passport = require('passport');
const { Strategy } = require('passport-discord');
const config = require('../../config.js');
const global = require('../global');

passport.serializeUser((user, done) => {
    console.log(`Serializing user: ${user.username}`);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await global.users.find(users => users.id === id);
        if (!user) throw new Error('User not found');
        console.log(`Deserializing ${id} as ${user.username}`);
        done(null, user);
    } catch (error) {
        console.log(error);
        done(error, null);
    }
});

passport.use(
    new Strategy({
        clientID: config.clientId,
        clientSecret: config.clientSecret,
        callbackURL: `http://localhost:${process.env.PORT || 8080}/auth/redirect`,
        scope: ['identify', 'guilds']
    }, async (accessToken, refreshToken, profile, done) => {
        console.log("--- Authenticating...");
        try {
            const user = await global.users.find(el => el.id === profile.id);
            if(user) {
                console.log(`-- User found: ${user.username}`);
                return done(null, user);
            } else {
                await global.users.push({
                    id: profile.id,
                    username: profile.username,
                    avatar: profile.avatar,
                    discriminator: profile.discriminator,
                    guilds: profile.guilds.map(guild => ({
                        id: guild.id,
                        name: guild.name,
                        icon: guild.icon,
                    }))
                });
                console.log(`-- Added user: ${profile.username}`);
                return done(null, profile);
            }
        } catch (err) {
            console.log(err);
            return done(err, null);
        }
    })
)
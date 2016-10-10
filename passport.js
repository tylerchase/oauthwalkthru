var queries = require('./db/query');
var passport = require('passport')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var knex = require('./db/knex_config')
var dotenv = require('dotenv').config()

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback",  //
        passReqToCallback: true
    },
    function(request, accessToken, refreshToken, profile, done) {
      queries.getAllUsersByIdAndGoogleProfileId(profile)
            .then(function(user) {
                if (user) {
                    //console.log('It worked and didnt add a new user')
                    return done(null, user)
                } else {
                    //console.log("it added a new user")
                    queries.getAllUsers().insert({
                            googleID: profile.id,
                            token: accessToken,
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            photo: profile.photos[0].value
                        }, "*")
                        .then((users) => {
                            return done (null, users[0])
                        })
                }
            })

    }
));

module.exports = {
  passport: passport,

  //route middleware to ensure user is authenticated
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      //console.log('user is authenticated')
        return next();
    } else {
        //console.log('ensure authenticated didnt work')
        res.redirect('/');
    }
}}

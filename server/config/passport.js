var mongoose            = require('mongoose'),
    LocalStrategy       = require('passport-local').Strategy,
    FacebookStrategy    = require('passport-facebook').Strategy,
    GoogleStrategy      = require('passport-google-oauth').OAuth2Strategy,
    TwitterStrategy     = require('passport-twitter').Strategy,
    User                = mongoose.model('User'),
    Auth                = require('./auth'),
    crypto              = require('../utilities/crypto');

module.exports = function (passport) {

    passport.use('local', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'},
        function (email, password, done) {

            User.findOne({ 'local.email': email }).exec(function (err, user) {

                if (user && user.authenticate(password)) {
                    return done(null, user);
                }
                else {
                    return done(null, false);
                }
            });
        }));

    passport.use('local-connect', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true},
       function (req, email, password, done) {
           process.nextTick(function () {
               User.findOne({'local.email': email}, function(err, existingUser) {
                    if (err)
                        return done(err);

                    // check to see if there's already a user with that email
                    if (existingUser)
                        return done(null, false);

                    //  If we're logged in, we're connecting a new local account.
                    if(req.user) {
                        var user = req.user;
                        user.local.email = email;
                        user.local.userName = req.body.userName;
                        user.local.salt = crypto.createSalt();
                        user.local.hashedPassword = crypto.hashPassword(password, user.local.salt);

                        user.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, user);
                        });
                    }
                        //  This strategy should never be called by annymous user.
                    else {
                        throw new Error('can only link to logged in user.');
                    }
            });
        });
    }));

    passport.use(new TwitterStrategy({
            consumerKey: Auth.config.twitterAuth.consumerKey,
            consumerSecret: Auth.config.twitterAuth.consumerSecret,
            callbackURL: Auth.config.twitterAuth.callbackURL,
            passReqToCallback: true
        },
        function (req, token, tokenSecret, profile, done) {

            // make the code asynchronous
            process.nextTick(function () {
                // user not logged in, no need to link with existing user.
                if (!req.user) {
                    User.findOne({ 'twitter.id': profile.id }, function (err, user) {
                        if (err)
                            return done(err);

                        if (user) {
                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser = new User();

                            newUser.twitter.id = profile.id;
                            newUser.twitter.token = token;
                            newUser.twitter.username = profile.username;
                            newUser.twitter.displayName = profile.displayName;

                            newUser.save(function (err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });
                } else {
                    var user = req.user; // pull the user out of the session

                    // update the current users google credentials
                    user.twitter.id = profile.id;
                    user.twitter.token = token;
                    user.twitter.username = profile.username;
                    user.twitter.displayName = profile.displayName;

                    // save the user
                    user.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                }
        });
    }));

    passport.use(new GoogleStrategy({

        clientID: Auth.config.googleAuth.clientID,
        clientSecret: Auth.config.googleAuth.clientSecret,
        callbackURL: Auth.config.googleAuth.callbackURL,
        passReqToCallback: true
    },
    function (req, token, refreshToken, profile, done) {

        // make the code asynchronous
        process.nextTick(function () {
            // user not logged in, no need to link with existing user.
            if (!req.user) {
                // try to find the user based on their google id
                User.findOne({ 'google.id': profile.id }, function (err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        // if a user is found, log them in
                        return done(null, user);
                    } else {

                        var newUser = new User();
                        newUser.google.id = profile.id;
                        newUser.google.token = token;
                        newUser.google.name = profile.displayName;
                        newUser.google.email = profile.emails[0].value;

                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            } else {

                var user = req.user;

                // update the current users google credentials
                user.google.id = profile.id;
                user.google.token = token;
                user.google.name = profile.displayName;
                user.google.email = profile.emails[0].value;

                user.save(function (err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }
        });
    }));

    passport.use(new FacebookStrategy({
        // pull in our app id and secret from our auth.js file
        clientID: Auth.config.facebookAuth.clientID,
        clientSecret: Auth.config.facebookAuth.clientSecret,
        callbackURL: Auth.config.facebookAuth.callbackURL,
        passReqToCallback: true
    }, function (req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function () {
            // user not logged in, no need to link with existing user.
            if (!req.user) {

                User.findOne({ 'facebook.id': profile.id }, function (err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser = new User();

                        newUser.facebook.id = profile.id;
                        newUser.facebook.token = token;
                        newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.facebook.email = profile.emails[0].value;

                        newUser.save(function (err) {
                            if (err)
                                throw err;

                            return done(null, newUser);
                        });
                    }
                });
            } else {
                var user = req.user;
                // update the current users facebook credentials
                user.facebook.id = profile.id;
                user.facebook.token = token;
                user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                user.facebook.email = profile.emails[0].value;

                user.save(function (err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });
            }
        });
    }));

    passport.serializeUser(function (user, done) {
        if (user) {
            return done(null, user._id);
        }
    });

    passport.deserializeUser(function (id, done) {
        User.findOne({ _id: id }).exec(function (err, user) {
            if (user) {
                return done(err, user);
            }
            else {
                return done(err, false);
            }
        });
    });
}

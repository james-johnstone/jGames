var passport = require('passport');

exports.authenticate = function (req, res, next) {

    req.body.email = (req.body.email || "").toLowerCase();

    var auth = passport.authenticate('local', function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            res.send({ success: false });
        }
        else {
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                res.send({ success: true, user: user });
            });
        }
    });
    auth(req, res, next);
};

exports.requiresApiLogin = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.status(403);
        res.end();
    }
    else {
        next();
    }
};

exports.requiresRole = function (role) {
    return function (req, res, next) {
        if (!req.isAuthenticated() || req.user.local.roles.indexOf(role) === -1) {
            res.status(403);
            res.end();
        }
        else {
            next();
        }
    };
};

exports.config = {
    'facebookAuth': {
        'clientID': '866991250010081',
        'clientSecret': '',
        'callbackURL': 'http://james-johnstone.me/auth/facebook/callback'
    },

    'twitterAuth': {
        'consumerKey': 'GsS4f70F0BOgQqQ4BY7SBqLL8',
        'consumerSecret': '',
        'callbackURL': 'http://james-johnstone.me/auth/twitter/callback'
    },

    'googleAuth': {
        'clientID': '718084310608-muvrq0p1kdh8rooit7ueik4jg31qm88b.apps.googleusercontent.com',
        'clientSecret': '',
        'callbackURL': 'http://james-johnstone.me/auth/google/callback'
    }
};

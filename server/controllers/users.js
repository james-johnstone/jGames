var User = require('mongoose').model('User'),
    crypto = require('../utilities/crypto');

exports.getUsers = function (req, res) {
    User.find({}).exec(function (err, collection) {
        res.send(collection);
    });
};

exports.getUser = function (req, res) {
    User.findOne({ _id: req.params.id }).exec(function (err, user) {
        if (err) {
            res.status(400);
            return res.send({ reason: err.toString() });
        }
        res.send(user);
    });
};

exports.createUser = function (req, res, next) {
    var userData = req.body;
    userData.local.salt = crypto.createSalt();
    userData.local.hashedPassword = crypto.hashPassword(userData.local.password, userData.local.salt);

    User.create(userData, function (err, user) {
        if (err) {
            if (err.toString().indexOf('E11000') > -1) {
                err = new Error('Username already registered');
            }
            res.status(400);
            return res.send({ reason: err.toString() });
        }
        req.login(user, function (err) {
            if (err) {
                return next(err);
            }
            res.send(user);
        });
    });
};

exports.updateUser = function (req, res) {
    var userData = req.body;

    if (!!userData.local.password) {
        userData.local.hashedPassword = crypto.hashPassword(userData.local.password, crypto.createSalt());
    }

    var userID = userData._id;
    delete userData._id;

    //!= needed for cast to string
    if (req.user._id != userID && !req.user.hasRole('admin')) {
        res.status(403);
        return res.end();
    }

    User.update({ _id: userID }, { $set: userData }, function (err) {
        if (err) {
            if (err.toString().indexOf('E11000') > -1) {
                console.log(err.toString());
                err = new Error('Username already registered');
            }
            res.status(400);
            return res.send({ reason: err.toString() });
        }
        res.send(req.user);
    });
};
var mongoose = require('mongoose'),
    crypto = require('../utilities/crypto');

var userSchema = mongoose.Schema({
    local: {
        firstName: String,
        lastName: String,
        userName: { type: String, unique: true, trim: true, sparse: true },
        email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
        salt: String,
        hashedPassword: String,
        roles: [String]
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    twitter: {
        id: String,
        token: String,
        displayName: String,
        username: String
    },
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    }
});

userSchema.methods = {
    authenticate: function (password) {
        return crypto.hashPassword(password, this.local.salt) === this.local.hashedPassword;
    },
    hasRole: function (role) {
        return this.local.roles.indexOf(role) > -1;
    }
};

var User = mongoose.model('User', userSchema);

function createDefaultUsers() {
    User.find({}).exec(function (err, collection) {
        if (collection.length === 0) {
            var salt, hash;
            salt = crypto.createSalt();
            hash = crypto.hashPassword('test', salt);

            User.create({ local: { email: 'admin@uat.co', firstName: 'Jamie', lastName: 'Johnstone', userName: 'Jamie', salt: salt, hashedPassword: hash, roles: ["admin"] } });
            User.create({local:{ email: 'user@uat.co', firstName: 'Dr', lastName: 'Doom', userName: 'Doc', salt: salt, hashedPassword: hash, }});
        }
    });
}

exports.createDefaultUsers = createDefaultUsers;
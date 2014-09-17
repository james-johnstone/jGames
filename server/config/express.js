var express         = require('express'),
    passport        = require('passport'),
    stylus          = require('stylus'),
    morgan          = require('morgan'),
    bodyParser      = require('body-parser'),
    cookieParser    = require('cookie-parser'),
    expressSession  = require('express-session');

module.exports = function (app, config) {

    function compile(str, path) {
        return stylus(str).set('filename', path);
    }

    //app.set('views', config.rootPath + 'server\\views');
    app.set('views', config.rootPath + '/server/views');
    app.set('view engine', 'jade');

    app.use(morgan('dev'));
    app.use(cookieParser());
    app.use(bodyParser());
    app.use(expressSession({ secret: 'eto' }));

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(stylus.middleware(
        {
            src: config.rootPath + '/public',
            compile: compile
        }
    ));
    app.use(express.static(config.rootPath + 'public'));
}
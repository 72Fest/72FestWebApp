/*jslint nomen: true */
/*global require, module, __dirname */
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

//monog db connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/72Fest');
var db = mongoose.connection;
var schemas = require('./schemas');

//routes
var routes = require('./routes/index');
var users = require('./routes/users');
var ApiRouteManager = require('./routes/ApiRouteManager');
var api = new ApiRouteManager(mongoose, app);

//seed data process
var SeedImporter = require('./seed');

var app = express();

// set up logging
var logPath = __dirname + '/logs';
var logFile = logPath + '/access.log';
//if log path doesn't exist, create it
if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath);
}
var accessLogStream = fs.createWriteStream(logFile, {flags: 'a'});
console.log("Starting logging at: " + logFile);
app.use(logger('combined', {stream: accessLogStream}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.enable("jsonp callback");

app.use(favicon());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/photos", express.static(path.resolve(path.join(__dirname, 'public/photos'))));
app.use("/logos", express.static(path.resolve(path.join(__dirname, 'public/logos'))));

app.use('/', routes);
app.use('/users', users);
app.use('/api', api.router);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//handle DB stuff
db.on('error', function (err) {
    console.error("Had problems connecting to mongodb: " + err);
    process.exit(1);
});
db.once('open', function callback () {
    console.log("We connected to mongodb!");

    //initialize schemas
    schemas.init(mongoose);
    var seedImporter = new SeedImporter(mongoose);
});

module.exports = app;

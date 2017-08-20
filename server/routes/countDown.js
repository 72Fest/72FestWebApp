/*global require, module */
var express = require('express');
var router = express.Router();

var countdownMetadata = {
    caption: 'Film Screening Countdown',
    time: {
        year: 2014,
        month: 10,
        day: 11,
        hour: 18,
        minute: 0,
        second: 0
    }
};

/* GET countdown. */
router.get('/', function (req, res) {
    'use strict';

    res.jsonp(countdownMetadata);
});

module.exports = router;

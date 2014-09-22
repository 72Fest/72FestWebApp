/*jslint nomen: true */
/*global require, module, exports, __dirname */
var express = require('express'),
    router = express.Router(),
    formidable = require('formidable'),
    easyimg = require('easyimage'),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    extend = require('util')._extend,
    thumbnailDimension = 100,
    db = null,
    Photo = null,
    Vote = null,
    Team = null,
    schemas = require('../schemas'),
    delegate = null,
    sendResult = function (res, isSucc, msg) {
        "use strict";

        var obj = {
            isSuccess: isSucc,
            message: msg
        };
        //res.writeHead(200, {'content-type': 'application/json'});
        res.jsonp(obj);
    },
    AdminRouter = function (dbRef, d) {
        "use strict";
        //we want the base path to be reference from parent folder of cur directory
        //var fullPhotoPath = path.resolve(path.join(__dirname, "..", photosBasePath));

        //save reference to delegate

        //save mongo reference
        db = dbRef;

        //initialize mongoose schemas and models
        schemas.init(db);
        Photo = schemas.Photo;

        return {
            router: router
        };
    };

router.get('/', function (req, res) {
    "use strict";
    sendResult(res, true, "Invalid API call");
});

//add route to html page related to approvals
router.get('/approve/', function (req, res) {
    "use strict";
    res.sendFile(path.resolve(path.join(__dirname, '../approve/approve.html')));
});

module.exports = AdminRouter;

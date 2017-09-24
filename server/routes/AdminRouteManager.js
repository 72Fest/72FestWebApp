/*jslint nomen: true */
/*global require, module, exports, __dirname */
var express = require('express'),
    router = express.Router(),
    path = require('path'),
    db = null,
    schemas = require('../schemas'),
    sendResult = function (res, isSucc, msg) {
        'use strict';

        var obj = {
            isSuccess: isSucc,
            message: msg
        };
        //res.writeHead(200, {'content-type': 'application/json'});
        res.jsonp(obj);
    },
    AdminRouter = function (dbRef) {
        'use strict';
        //we want the base path to be reference from parent folder of cur directory
        //var fullPhotoPath = path.resolve(path.join(__dirname, "..", photosBasePath));

        //save reference to delegate

        //save mongo reference
        db = dbRef;

        //initialize mongoose schemas and models
        schemas.init(db);
        // Photo = schemas.Photo;

        return {
            router: router
        };
    };

router.get('/', function (req, res) {
    'use strict';
    res.sendFile(path.resolve(path.join(__dirname, '../dashboard/index.html')));
});

//add route to html page related to approvals
router.get('/approve/', function (req, res) {
    'use strict';
    res.sendFile(path.resolve(path.join(__dirname, '../approve/approve.html')));
});

module.exports = AdminRouter;

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
    photosBasePath = 'public/photos',
    thumbnailDimension = 100,
    db = null,
    Photo = null,
    Vote = null,
    schemas = require('../schemas'),
    delegate = null,
    //TODO: remove hardcoded reference into Mongo DB
    countdownMetadata = {
        caption: "Film Screening Countdown",
        time: {
            year: 2014,
            month: 10,
            day: 11,
            hour: 18,
            minute: 0,
            second: 0
        }
    },
    //default photos metadata if not retreived from DB
    photosMetadata = {
        baseUrl: "http://192.168.1.10:3000"
    },
    sendResult = function (res, isSucc, msg) {
        "use strict";

        var obj = {
            isSuccess: isSucc,
            message: msg
        };
        //res.writeHead(200, {'content-type': 'application/json'});
        res.jsonp(obj);
    },
    processUpload = function (fileObj, callback) {
        "use strict";

        var photo,
            thumbPath,
            newPhotoPath;

        //create mongo model instance and persist to datastore
        photo = new Photo({
            originalPhotoName: fileObj.name,
            size: fileObj.size,
            timestamp: Date.now()
        });

        //TODO: fix this to not hardcode extensions
        newPhotoPath = path.resolve(path.join(__dirname, "..", photosBasePath, photo._id + ".jpg"));
        thumbPath = path.resolve(path.join(__dirname, "..", photosBasePath, photo._id + "-thumb.jpg"));
        //lets move the photo into the uploads folder

        fs.rename(fileObj.path, newPhotoPath, function (err) {
            if (err) {
                callback(err, "Could not move image to final destination");
            } else {
                //store path info
                photo.originalPath = newPhotoPath;
                photo.photoUrl = path.join(path.basename(photosBasePath), path.basename(newPhotoPath));

                //now create a thumbnail image
                easyimg.thumbnail({
                    width: thumbnailDimension,
                    height: thumbnailDimension,
                    src: newPhotoPath,
                    dst: thumbPath,
                    quality: 85
                }, function (err, img) {

                    if (err) {
                        callback(true, "Failed to create thumbnail!");
                    } else {
                        //great, we have the thumbnail!
                        //upadate the photo model to have the thumbnail
                        photo.thumbPath = thumbPath;
                        photo.thumbUrl = path.join(path.basename(photosBasePath), path.basename(thumbPath));

                        //now lets save the model
                        photo.save(function (err, model) {
                            if (err) {
                                callback(true, "Failed while processing image!");
                            } else {
                                if (delegate) {
                                    delegate.onUploadSuccess(photo);
                                }
                                callback(false, "Photo upload was a success");
                            }
                        });

                    }
                });


            }
        });
    },
    ApiRouter = function (dbRef, d) {
        //we want the base path to be reference from parent folder of cur directory
        var fullPhotoPath = path.resolve(path.join(__dirname, "..", photosBasePath));

        //save reference to delegate
        delegate = d;

        //save mongo reference
        db = dbRef;

        //initialize mongoose schemas and models
        Photo = schemas.Photo;
        Vote = schemas.Vote;

        //create the ouptfolder if it doesn't already exist
        //make sure dir exists
        fs.exists(fullPhotoPath, function (exists) {
            if (!exists) {
                //TODO: should this be async?
                fs.mkdir(fullPhotoPath, 0766, function (err) {
                    if (err) {
                        throw new Error("Could not create photos path!");
                    }
                });
            }
        });

        return {
            router: router
        };
    };

router.get('/', function (req, res) {
    "use strict";
    sendResult(res, true, "Invalid API call");
});

router.get('/countDown', function (req, res) {
    "use strict";

    sendResult(res, true, countdownMetadata);
});

router.get('/photos', function (req, res) {
    "use strict";

    var resultsObj = {
        metadata: extend({}, photosMetadata),
        photos: []
    };

    //TODO: retrieve photos metadata from mongodb

    Photo.find({}).sort({timestamp: -1}).exec(function (err, models) {
        var idx,
            curObj,
            results = [];

        //handle photo results
        if (err) {
            sendResult(res, false, "Failed to retrieve list of photos!");
        } else {
            //loop through results and build index
            for (idx = 0; idx < models.length; idx += 1) {
                curObj = {
                    id: models[idx]._id,
                    photoUrl: models[idx].photoUrl,
                    thumbUrl: models[idx].thumbUrl
                };

                results.push(curObj);
            }
            //add results to photos
            resultsObj.photos = results;
            sendResult(res, true, resultsObj);
        }
    });
});
router.get('/votes', function (req, res) {
    "use strict";

    var idx,
        results = [];

    Vote.find({}).exec(function (err, models) {
        if (err) {
            sendResult(res, false, "Failed to retrieve list of votes!");
        } else {
            //loop through all votes
            for (idx = 0; idx < models.length; idx += 1) {
                results.push({
                    id: models[idx].id,
                    votes: models[idx].votes
                });
            }

            sendResult(res, true, results);
        }

    });
});
router.get('/votes/:voteId', function (req, res) {
    "use strict";

    var voteId = req.params.voteId;

    //TODO: sanatize the voteId
    Vote.findOne({ id: voteId}, 'id votes', function (err, voteModel) {
        if (err) {
            sendResult(res, false, "Failed to retrieve votes for specified id!");
        } else if (voteModel === null) {
            //if not in the DB, just return zero votes
            sendResult(res, true, { id: voteId, votes: 0});
        } else {
            sendResult(res, true, { id: voteId, votes: voteModel.votes});
        }
    });
});
router.post('/vote', function (req, res) {
    "use strict";

    var form = new formidable.IncomingForm(),
        voteId,
        voteTotal,
        unliked;

    form.parse(req, function (err, fields, files) {
        if (err) {
            sendResult(res, false, "Failed to process vote request!");
        } else {
            voteId = fields.id;
            unliked = (fields.unlike === undefined) ? false : true;

            if (!voteId) {
                sendResult(res, false, "Invalid vote request!");
                return;
            }

            //lets get current value
            Vote.findOne({ id: voteId}, 'id votes', function (err, voteModel) {
                if (err) {
                    sendResult(res, false, "Failed to process vote request!");
                    return;
                }

                if (voteModel) {
                    voteTotal = Math.max((unliked) ? voteModel.votes -= 1 : voteModel.votes += 1, 0);
                    voteModel.votes = voteTotal;
                } else {
                    voteTotal = 1;
                    voteModel = new Vote({id: voteId, votes: voteTotal});
                }

                voteModel.save(function (err) {
                    if (err) {
                        sendResult(res, false, "Failed to process vote request!");
                    } else {
                        console.log("TOTAL VOTES: " + voteId + ", " + voteTotal);
                        sendResult(res, true, { id: voteId, votes: voteTotal});
                    }
                });

            });

            console.log("the ID:" + voteId + ", and unlike status:" + unliked);
        }
    });

});

router.post('/upload', function (req, res) {
    "use strict";

    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        var fileObj,
            photo;

        //if a file is provided, continue to process image
        if (files && Object.keys(files).length) {
            //Create mongodb model and persist it
            fileObj = files[Object.keys(files)[0]]; //get the file obj ref

            processUpload(fileObj, function (err, msg) {
                sendResult(res, !err, msg);
            });

        } else {
            sendResult(res, false, "No photo was supplied!");
        }
    });

    return;
});

module.exports = ApiRouter;

/*jslint nomen: true */
/*global require, module, exports, __dirname */
var express = require('express'),
    router = express.Router(),
    formidable = require('formidable'),
    easyimg = require('easyimage'),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    ObjectId = require('mongoose').Types.ObjectId, //needed for mongo's _id
    extend = require('util')._extend,
    config = require('../config.json'),
    photosBasePath = 'public/photos',
    thumbnailDimension = 384,
    io = null,
    db = null,
    Photo = null,
    Vote = null,
    Team = null,
    schemas = require('../schemas'),
    delegate = null,
    countdownMetadata = config.filmingCountdownMetadata,
    PhotoListType = {
        ALL: "allPhotos",
        REJECTED: "rejectedPhotos",
        APPROVED: "approvedPhotos"
    },
    //default photos metadata if not retreived from DB
    photosMetadata = {
        baseUrl: config.baseUrl,
        logosPath: config.logosPath
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
                    src: newPhotoPath,
                    dst: thumbPath,
                    quality: 90
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
                                    delegate.getSocket().emit('photoUploaded', {"photo": photo});
                                }
                                callback(false, "Photo upload was a success");
                            }
                        });

                    }
                });


            }
        });
    },
    processPhotoList = function (req, res, listType) {
        "use strict";
        var photosQuery = Photo.find({});

        //handle the different cases for listing photos
        switch (listType) {
        case PhotoListType.APPROVED:
            photosQuery = photosQuery.where('isRejected').equals(false);
            break;
        case PhotoListType.REJECTED:
            photosQuery = photosQuery.where('isRejected').equals(true);
            break;
        }

        photosQuery.sort({timestamp: -1}).exec(function (err, models) {
            //TODO: retrieve photos metadata from mongodb
            var idx,
                curObj,
                results = [],
                resultsObj = {
                    metadata: extend({}, photosMetadata),
                    photos: []
                };

            //handle photo results
            if (err) {
                sendResult(res, false, "Failed to retrieve list of photos!");
            } else {
                //loop through results and build index
                for (idx = 0; idx < models.length; idx += 1) {
                    curObj = {
                        id: models[idx]._id,
                        photoUrl: models[idx].photoUrl,
                        thumbUrl: models[idx].thumbUrl,
                        isRejected: models[idx].isRejected
                    };

                    results.push(curObj);
                }
                //add results to photos
                resultsObj.photos = results;
                sendResult(res, true, resultsObj);
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
        schemas.init(db);
        Photo = schemas.Photo;
        Vote = schemas.Vote;
        Team = schemas.Team;

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

    processPhotoList(req, res, PhotoListType.APPROVED);
});

router.get('/photos/all', function (req, res) {
    "use strict";

    processPhotoList(req, res, PhotoListType.ALL);
});

router.get('/photos/rejected', function (req, res) {
    "use strict";

    processPhotoList(req, res, PhotoListType.REJECTED);
});

router.get('/photo/reject/:photoId', function (req, res) {
    "use strict";

    var photoId = req.params.photoId,
        query = { _id: new ObjectId(photoId) };

    Photo.findOneAndUpdate(query, { isRejected: true }, function (err, model) {
        if (err) {
            sendResult(res, false, "Failed to reject photo!");
        } else {
            sendResult(res, true, {success: true});
            delegate.getSocket().emit('photoRejected', { photo: model });
        }
    });
});

router.get('/photo/approve/:photoId', function (req, res) {
    "use strict";

    var photoId = req.params.photoId,
        query = { _id: new ObjectId(photoId) };

    Photo.findOneAndUpdate(query, { isRejected: false }, function (err, model) {
        if (err) {
            sendResult(res, false, "Failed to approve photo!");
        } else {
            sendResult(res, true, {success: true});
            delegate.getSocket().emit('photoApproved', { photo: model });
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

router.get('/teams', function (req, res) {
    "use strict";

    var idx;

    Team.find({}).sort({teamName: 'asc'}).exec(function (err, models) {
        if (err) {
            sendResult(res, false, "Failed to retrieve list of teams!");
        } else {
            //return team models minus the _id field
            //also append full URL onto each model
            models.forEach(function (teamModel) {
                teamModel.logo = photosMetadata.baseUrl +
                                 photosMetadata.logosPath + "/" +
                                 teamModel.logo;
            });

            sendResult(res, true, models);
        }

    });
});
router.get('/teams/:teamId', function (req, res) {
    "use strict";

    var that = this,
        teamId = req.params.teamId;

    //TODO: sanatize the teamId
    Team.findOne({ _id: teamId}, function (err, teamModel) {
        if (err) {
            sendResult(res, false, "Failed to retrieve details for specified team id!");
        } else if (teamModel === null) {
            //if not in the DB, just return empty object
            sendResult(res, false, {});
        } else {
            //return team data
            //pass full URL of logo when querying an individual team
            teamModel.logo = photosMetadata.baseUrl +
                             photosMetadata.logosPath + "/" +
                             teamModel.logo;
            sendResult(res, true, teamModel);
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

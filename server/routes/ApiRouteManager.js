/*jslint nomen: true */
/*global require, module, __dirname */
var express = require('express'),
    router = express.Router(),
    formidable = require('formidable'),
    easyimg = require('easyimage'),
    fs = require('fs'),
    path = require('path'),
    ObjectId = require('mongoose').Types.ObjectId, //needed for mongo's _id
    extend = require('util')._extend,
    config = require('../config.json'),
    auth = require('../auth'),
    moment = require('moment'),
    Cloud = require('../lib/cloud'),
    cloud = new Cloud('72fest-photos-dev', 'uploads'),
    photosBasePath = 'public/photos',
    thumbnailWidthDimension = 384,
    thumbnailHeightDimension = 384,
    db = null,
    Photo = null,
    Vote = null,
    Team = null,
    News = null,
    Sponsor = null,
    Countdown = null,
    schemas = require('../schemas'),
    delegate = null,
    countdownMetadata = config.filmingCountdownMetadata,
    PhotoListType = {
        ALL: 'allPhotos',
        REJECTED: 'rejectedPhotos',
        APPROVED: 'approvedPhotos'
    },
    //default photos metadata if not retreived from DB
    photosMetadata = {
        baseUrl: config.baseUrl,
        logosPath: config.logosPath,
        defaultTeamLogo: 'no-logo.png'
    },
    sendResult = function (res, isSucc, msg) {
        'use strict';

        var obj = {
            isSuccess: isSucc,
            message: msg
        };
        //res.writeHead(200, {'content-type': 'application/json'});
        res.jsonp(obj);
    },
    processUpload = function (fileObj, callback) {
        'use strict';

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
        newPhotoPath = path.resolve(path.join(__dirname, '..', photosBasePath, photo._id + '.jpg'));
        thumbPath = path.resolve(path.join(__dirname, '..', photosBasePath, photo._id + '-thumb.jpg'));
        //lets move the photo into the uploads folder

        fs.rename(fileObj.path, newPhotoPath, function (err) {
            if (err) {
                callback(err, 'Could not move image to final destination');
            } else {
                //store path info
                photo.originalPath = newPhotoPath;
                // photo.photoUrl = path.join(path.basename(photosBasePath), path.basename(newPhotoPath));

                //now create a thumbnail image
                easyimg.resize({
                    width: thumbnailWidthDimension,
                    height: thumbnailHeightDimension,
                    src: newPhotoPath,
                    dst: thumbPath,
                    quality: 90,
                    ignoreAspectRatio: false
                }, function (err) {

                    if (err) {
                        callback(true, 'Failed to create thumbnail!');
                    } else {
                        //great, we have the thumbnail!
                        //upadate the photo model to have the thumbnail
                        photo.thumbPath = thumbPath;
                        // photo.thumbUrl = path.join(path.basename(photosBasePath), path.basename(thumbPath));

                        // upload images to s3 bucket
                        cloud.upload(newPhotoPath)
                            .then((uploadRes) => {
                                console.log('full img url:', uploadRes.Location);
                                photo.photoUrl = uploadRes.Location;

                                return cloud.upload(thumbPath)
                                    .then((thumbUploadRes) => {
                                        console.log('thumb img url:', thumbUploadRes.Location);
                                        photo.thumbUrl = thumbUploadRes.Location;
                                    })
                                    .catch((errMsg) => {
                                        console.log(`S3 error: ${errMsg}`);
                                        callback(true, errMsg);
                                    });
                            })
                            .then(() => {
                                //now lets save the model
                                photo.save(function (err) {
                                    if (err) {
                                        callback(true, 'Failed while processing image!');
                                    } else {
                                        if (delegate) {
                                            delegate.getSocket().emit('photoUploaded', {'photo': photo});
                                        }

                                        // send notification of photo upload
                                        var photoMsg = 'A new photo was added to the gallery.';
                                        cloud.publishToTopic(config.awsTopicArn, photoMsg);

                                        // finish by invoking callback
                                        callback(false, 'Photo upload was a success');
                                    }
                                });
                            })
                            .catch((errMsg) => {
                                console.log(`S3 error: ${errMsg}`);
                                callback(true, errMsg);
                            });
                    }
                });


            }
        });
    },
    processPhotoList = function (req, res, listType) {
        'use strict';
        var photosQuery = Photo.find({}),
            metaDataTimestamp = extend({}, countdownMetadata.time),
            filmStartTime,
            filmEndTime,
            curTimestamp,
            timeLeft;

        //decrease month value as it is zero-indexed
        metaDataTimestamp.month -= 1;
        //calculate the start and end timestamps for filming
        filmStartTime = moment(metaDataTimestamp);
        filmEndTime = moment(filmStartTime).add(72, 'hours');

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
                sendResult(res, false, 'Failed to retrieve list of photos!');
            } else {
                //loop through results and build index
                for (idx = 0; idx < models.length; idx += 1) {
                    curObj = {
                        id: models[idx]._id,
                        photoUrl: models[idx].photoUrl,
                        thumbUrl: models[idx].thumbUrl,
                        isRejected: models[idx].isRejected,
                        timestamp: models[idx].timestamp
                    };

                    //determine if current photo was taken during filming
                    //if so, update the object to tag the hour it was taken
                    curTimestamp = moment(curObj.timestamp);
                    if (curTimestamp.isBetween(filmStartTime, filmEndTime)) {
                        curObj.isFilmHour = true;
                        timeLeft = filmEndTime.diff(curTimestamp, 'hours');

                        //calculate how many hours are left
                        if (timeLeft > 1) {
                            //if there is at least 2 hours left, it's plural
                            curObj.filmHour = timeLeft + ' hours left';
                        } else if (timeLeft === 1) {
                            //if there is 1 hour left, hours is singular
                            curObj.filmHour = timeLeft + ' hour left';
                        } else {
                            //it is less than zero, so it must be minutes left
                            timeLeft = filmEndTime.diff(curTimestamp, 'minutes');
                            if (timeLeft > 1) {
                                curObj.filmHour = timeLeft + ' minutes left';
                            } else {
                                curObj.filmHour = timeLeft + ' minute left';
                            }
                        }
                    }

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
        var fullPhotoPath = path.resolve(path.join(__dirname, '..', photosBasePath));

        //save reference to delegate
        delegate = d;

        //save mongo reference
        db = dbRef;

        //initialize mongoose schemas and models
        schemas.init(db);
        Photo = schemas.Photo;
        Vote = schemas.Vote;
        Team = schemas.Team;
        News = schemas.News;
        Sponsor = schemas.Sponsor;
        Countdown = schemas.Countdown;

        //create the ouptfolder if it doesn't already exist
        //make sure dir exists
        fs.exists(fullPhotoPath, function (exists) {
            if (!exists) {
                //TODO: should this be async?
                fs.mkdir(fullPhotoPath, 0766, function (err) {
                    if (err) {
                        throw new Error('Could not create photos path!');
                    }
                });
            }
        });

        return {
            router: router
        };
    };

router.get('/', function (req, res) {
    'use strict';
    sendResult(res, true, 'Invalid API call');
});

router.get('/countDown', function (req, res) {
    'use strict';

    Countdown.findOne({}, function (err, countdownModel) {
        if (err) {
            sendResult(res, false, 'Failed to retrieve countdown');
        } else if (countdownModel === null) {
            //if not in the DB, return the default from config
            sendResult(res, true, countdownMetadata);
        } else {
            sendResult(res, true, countdownModel);
        }
    });
});

router.post('/countDown', function (req, res) {
    var countdown = null;
    var {caption, year, month, day, hour, min = 0, sec = 0} = req.body;

    // ensure required fields are passed in
    if (!caption || !year || !month || !day || !hour) {
        return sendResult(res, false, 'Missing parameters');
    }

    // confirm valid numbers
    if (isNaN(year) || isNaN(month) || isNaN(day) ||
        isNaN(hour) || isNaN(min) || isNaN(sec)) {
        return sendResult(res, false, 'Times must be valid');
    }

    // create model based on input
    countdown = new Countdown({
        caption,
        time: {
            year,
            month,
            day,
            hour,
            minute: min,
            second: sec
        }
    });

    // remove current countdowns
    Countdown.remove({}, function (rmErr) {
        if (rmErr) {
            return sendResult(res, false, 'Failed reset countdown');
        }

        // persists new countdown
        countdown.save(function (err) {
            if (err) {
                return sendResult(res, false, 'Failed to update countdown');
            }

            return sendResult(res, true, {success: true});
        });
    })

});

router.get('/photos', function (req, res) {
    'use strict';

    processPhotoList(req, res, PhotoListType.APPROVED);
});

router.get('/photos/all', function (req, res) {
    'use strict';

    processPhotoList(req, res, PhotoListType.ALL);
});

router.get('/photos/rejected', function (req, res) {
    'use strict';

    processPhotoList(req, res, PhotoListType.REJECTED);
});

router.get('/photo/reject/:photoId', function (req, res) {
    'use strict';

    var photoId = req.params.photoId,
        query = { _id: new ObjectId(photoId) };

    Photo.findOneAndUpdate(query, { isRejected: true }, function (err, model) {
        if (err) {
            sendResult(res, false, 'Failed to reject photo!');
        } else {
            sendResult(res, true, {success: true});
            delegate.getSocket().emit('photoRejected', { photo: model });
        }
    });
});

router.get('/photo/approve/:photoId', function (req, res) {
    'use strict';

    var photoId = req.params.photoId,
        query = { _id: new ObjectId(photoId) };

    Photo.findOneAndUpdate(query, { isRejected: false }, function (err, model) {
        if (err) {
            sendResult(res, false, 'Failed to approve photo!');
        } else {
            sendResult(res, true, {success: true});
            delegate.getSocket().emit('photoApproved', { photo: model });
        }
    });
});

router.get('/votes', function (req, res) {
    'use strict';

    var idx,
        results = [];

    Vote.find({}).exec(function (err, models) {
        if (err) {
            sendResult(res, false, 'Failed to retrieve list of votes!');
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
    'use strict';

    var voteId = req.params.voteId;

    //TODO: sanatize the voteId
    Vote.findOne({ id: voteId}, 'id votes', function (err, voteModel) {
        if (err) {
            sendResult(res, false, 'Failed to retrieve votes for specified id!');
        } else if (voteModel === null) {
            //if not in the DB, just return zero votes
            sendResult(res, true, { id: voteId, votes: 0});
        } else {
            sendResult(res, true, { id: voteId, votes: voteModel.votes});
        }
    });
});
router.post('/vote', function (req, res) {
    'use strict';

    var voteId = req.body.id,
        unliked = req.body.unlike,
        voteTotal;

    if (!voteId) {
        sendResult(res, false, 'Invalid vote request!');
        return;
    }

    //lets get current value
    Vote.findOne({ id: voteId}, 'id votes', function (err, voteModel) {
        if (err) {
            sendResult(res, false, 'Failed to process vote request!');
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
            var vote = {};
            if (err) {
                sendResult(res, false, 'Failed to process vote request!');
            } else {
                vote.id = voteId;
                vote.votes = voteTotal;
                console.log('TOTAL VOTES: ' + voteId + ', ' + voteTotal);
                if (delegate) {
                    delegate.getSocket().emit('voteCast', vote);
                }
                sendResult(res, true, vote);
            }
        });

    });

    console.log('the ID:' + voteId + ', and unlike status:' + unliked);
});

router.get('/teams', function (req, res) {
    'use strict';

    Team.find({}).sort({teamName: 'asc'}).exec(function (err, models) {
        var baseLogoUrl = photosMetadata.baseUrl + '/' +
                photosMetadata.logosPath,
            defaultLogoUrl = photosMetadata.baseUrl + '/' +
                photosMetadata.defaultTeamLogo;

        if (err) {
            sendResult(res, false, 'Failed to retrieve list of teams!');
        } else {
            //return team models minus the _id field
            //also append full URL onto each model
            models.forEach(function (teamModel) {
                if (teamModel.logo) {
                    teamModel.logo = baseLogoUrl + '/' + teamModel.logo;
                } else {
                    teamModel.logo = defaultLogoUrl;
                }
            });

            sendResult(res, true, models);
        }

    });
});
router.get('/teams/:teamId', function (req, res) {
    'use strict';

    var teamId = req.params.teamId,
        baseLogoUrl = photosMetadata.baseUrl + '/' + photosMetadata.logosPath,
        defaultLogoUrl = photosMetadata.baseUrl + '/' + photosMetadata.defaultTeamLogo;

    //TODO: sanatize the teamId
    Team.findOne({ _id: teamId}, function (err, teamModel) {
        var films;

        if (err) {
            sendResult(res, false, 'Failed to retrieve details for specified team id!');
        } else if (teamModel === null) {
            //if not in the DB, just return empty object
            sendResult(res, false, {});
        } else {
            //return team data
            //pass full URL of logo when querying an individual team
            if (teamModel.logo) {
                teamModel.logo = baseLogoUrl + '/' + teamModel.logo;
            } else {
                teamModel.logo = defaultLogoUrl;
            }

            //sort the films by year before returning
            films = teamModel.films;
            if (Array.isArray(films) && films.length > 1 ) {
                films = films.sort(function (a, b) {
                    if (a.year < b.year) {
                        return 1;
                    }
                    if (a.year > b.year) {
                        return -1;
                    }
                    return 0;
                });
            }

            //sort the films
            sendResult(res, true, teamModel);
        }
    });
});

router.post('/upload', function (req, res) {
    'use strict';

    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        var fileObj;

        //if a file is provided, continue to process image
        if (files && Object.keys(files).length) {
            //Create mongodb model and persist it
            fileObj = files[Object.keys(files)[0]]; //get the file obj ref

            processUpload(fileObj, function (err, msg) {
                sendResult(res, !err, msg);
            });

        } else {
            sendResult(res, false, 'No photo was supplied!');
        }
    });

    return;
});

router.get('/news', function (req, res) {
    'use strict';

    var idx,
        results = [];

    News.find({}).sort({timestamp: -1}).exec(function (err, models) {
        if (err) {
            sendResult(res, false, 'Failed to retrieve news feed!');
        } else {
            //loop through all votes
            for (idx = 0; idx < models.length; idx += 1) {
                results.push({
                    id: models[idx].id,
                    timestamp: models[idx].timestamp,
                    title: models[idx].title,
                    content: models[idx].content
                });
            }

            sendResult(res, true, results);
        }

    });

});

router.get('/sponsors', function (req, res) {
    'use strict';

    Sponsor.find({}).exec(function (err, models) {
        if (err) {
            sendResult(res, false, 'Failed to retrieve list of sponsors!');
        } else {
            sendResult(res, true, models);
        }
    });
});

router.post('/register', function (req, res) {
    var tokenId = req.body.tokenId;
    var platform = req.body.platform;

    if (!tokenId || !platform) {
        res.status = 400;
        return res.end('Missing parameters!');
    }

    cloud.registerEndPoint(tokenId, platform)
        .then((results) => {
            res.json({isSuccess: true, data: results});
        })
        .catch((err) => {
            res.json({isSuccess: false, data: err.message});
        });
});

router.post('/publish', auth.basicAuth(config.adminUser, config.adminPass), function (req, res) {
    var form = new formidable.IncomingForm();

    // parse form for fields
    form.parse(req, function (err, fields) {
        if (err) {
            return res.json({
                isSuccess: false,
                data: err.message
            });
        } else if (!fields.message) {
            return res.json({
                isSuccess: false,
                data: 'Message not provided'
            });
        }

        // publish message to SNS topic
        cloud.publishToTopic(config.awsTopicArn, fields.message, fields.title)
            .then((results) => {
                res.json(results);
            })
            .catch((err) => {
                res.json({isSuccess: false, data: err});
            });
    });
});

module.exports = ApiRouter;

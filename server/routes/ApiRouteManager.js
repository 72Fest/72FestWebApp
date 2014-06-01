/*jslint nomen: true */
/*global require, module, exports */
var express = require('express'),
    router = express.Router(),
    formidable = require('formidable'),
    easyimg = require('easyimage'),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    photosBasePath = 'public/photos',
    thumbnailDimension = 100,
    db = null,
    photoSchema = null,
    Photo = null,
    delegate = null,
    initPhotoSchema = function (mg) {
        "use strict";

        var schema = mg.Schema({
            size: Number,
            photoUrl: String,
            thumbUrl: String,
            thumbPath: String,
            originalPath: String,
            originalPhotoName: String,
            timestamp: Date
        });

        return schema;
    },
    sendResult = function (res, isSucc, msg) {
        "use strict";

        var obj = {
            isSuccess: isSucc,
            message: msg
        };
        res.writeHead(200, {'content-type': 'application/json'});
        res.end(JSON.stringify(obj));
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
        newPhotoPath = path.resolve(path.join(photosBasePath, photo._id + ".jpg"));
        thumbPath = path.resolve(path.join(photosBasePath, photo._id + "-thumb.jpg"));
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
        var fullPhotoPath = path.resolve(photosBasePath);

        //save reference to delegate
        delegate = d;

        //save mongo reference
        db = dbRef;

        //initialize mongoose schema and models
        photoSchema = initPhotoSchema(db);
        Photo = db.model("Photo", photoSchema);

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
    res.end("OK");
});

router.get('/photos', function (req, res) {
    "use strict";

    Photo.find({}).sort({timestamp: -1}).exec(function (err, models) {
        //handle photo results
        if (err) {
            sendResult(res, false, "Failed to retrieve list of photos!");
        } else {
            //res.end(JSON.stringify(models));
            sendResult(res, true, JSON.stringify(models));
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

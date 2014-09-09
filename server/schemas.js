/*jslint nomen: true */
/*global require, module */
(function () {
    "use strict";

    var db,
        Photo,
        Vote,
        initPhotoSchema = function (mg) {
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
        initVoteSchema = function (mg) {

            var schema = mg.Schema({
                id: String,
                votes: { type: Number, default: 0 }
            });

            return schema;
        },
        init = function (dbVal) {
            this.db = dbVal;

            //initialize schemas
            var photoSchema = initPhotoSchema(dbVal),
                voteSchema = initVoteSchema(dbVal);

            //save schemas to namespace
            this.Photo = dbVal.model("Photo", photoSchema);
            this.Vote = dbVal.model("Vote", voteSchema);
        };

    exports.init = init;
    exports.Photo = Photo;
    exports.Vote = Vote;
}());

/*jslint nomen: true */
/*global require, exports, module */
(function () {
    "use strict";

    var db,
        Photo,
        Vote,
        Team,
        initPhotoSchema = function (mg) {
            var schema = new mg.Schema({
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

            var schema = new mg.Schema({
                id: String,
                votes: { type: Number, default: 0 }
            });

            return schema;
        },
        initTeamSchema = function (mg) {
            var schema = new mg.Schema({
                teamName: String,
                bio: String,
                website: String,
                logo: String,
                films: [
                    {
                        title: String,
                        year: Number,
                        url: String
                    }
                ]
            });

            return schema;
        },
        init = function (dbVal) {
            this.db = dbVal;

            //define or retrieve schemas and save to a namespace
            try {
                this.Photo = dbVal.model("Photo");
            } catch (err) {
                this.Photo = dbVal.model("Photo", initPhotoSchema(dbVal));
            }

            try {
                this.Vote = dbVal.model("Vote");
            } catch (err2) {
                this.Vote = dbVal.model("Vote", initVoteSchema(dbVal));
            }

            try {
                this.Team = dbVal.model("Team");
            } catch (err3) {
                this.Team = dbVal.model("Team", initTeamSchema(dbVal));
            }
        };

    exports.init = init;
    exports.Photo = Photo;
    exports.Vote = Vote;
    exports.Team = Team;
}());
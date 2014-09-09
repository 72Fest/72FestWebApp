/*jslint nomen: true */
/*global require, exports, module */
(function () {
    "use strict";

    var db,
        Photo,
        Vote,
        Team,
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
        initTeamSchema = function (mg) {
            var schema = mg.Schema({
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

            //initialize schemas
            var photoSchema = initPhotoSchema(dbVal),
                voteSchema = initVoteSchema(dbVal),
                teamSchema = initTeamSchema(dbVal);

            //save schemas to namespace
            this.Photo = dbVal.model("Photo", photoSchema);
            this.Vote = dbVal.model("Vote", voteSchema);
            this.Team = dbVal.model("Team", teamSchema);
        };

    exports.init = init;
    exports.Photo = Photo;
    exports.Vote = Vote;
    exports.Team = Team;
}());

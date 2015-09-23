/*jslint nomen: true */
/*global require, module */
(function () {
    "use strict";

    var teamsData = require("./seedData/teams.json"),
        schemas = require("./schemas"),
        SeedImporter = function (db) {
            schemas.init(db);
            var Team = schemas.Team;

            //check if there are documents for the Team Schema
            Team.find({}).exec(function (err, t) {
                if (err) {
                    console.error("Failed to query for Team schema");
                } else if (t.length === 0) {
                    console.log("Seeding Teams data ...");
                    teamsData.forEach(function (curTeamData) {
                        Team.create(curTeamData, function (err, d) {
                            if (err) {
                                console.error("Failed to insert data:" + curTeamData);
                            }
                        });
                    });
                }
            });

        },
        seedJSON = function (path, schemaName) {
        };

    module.exports = SeedImporter;
}());

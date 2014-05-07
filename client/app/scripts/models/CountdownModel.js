/*jslint nomen: true */
/*global define, _*/

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var formatTimeValue,
        CountdownModel;

    formatTimeValue = function (val) {
        return (val < 10) ? "0" + val : val;
    };

    CountdownModel = Backbone.Model.extend({

        //TODO: add a config var for this
        url: 'http://localhost:3000/countDown?callback=?',

        initialize: function () {
            var that = this;

            this.on("change", function (model) {
                //alert("model aption:" + model.get("caption"));
            });


            this.fetch({
                success: function (m) {
                    //the REST call was successful so start the timer
                    that.startTimer(that);
                },
                error: function () {
                    var timeLeft = {};
                    console.log("Failed to fetch countdown data. The end point is not reachable!");

                    timeLeft.day = "--";
                    timeLeft.hour = "--";
                    timeLeft.minute = "--";
                    timeLeft.second = "--";

                    //update model with generic place holders
                    that.set({remainingTime: timeLeft});
                }
            });
        },

        defaults: {
            caption: "72 Fest",
            time: "",
            remainingTime: ""
        },

        validate: function (attrs, options) {
        },

        parse: function (response, options) {
            return response;
        },

        startTimer: function (model) {
            //calc the time left

            var t = model.get("time"), //retrieve the end time
                timeLeft = {},
                endDate = new Date(t.year, t.month - 1, t.day, t.hour, t.minute, t.second),
                timeDiff,
                curSecs,
                endSecs = endDate.getTime() / 1000,
                secsInMin = 60,
                secsInHour = secsInMin * 60,
                secsInDay = secsInHour * 24;

            setInterval(function () {
                var curDate = new Date();
                timeLeft = {};
                curSecs = curDate.getTime() / 1000;
                timeDiff = endSecs - curSecs;

                if (timeDiff <= 0) {
                    //Time has expired, zero everything out
                    timeLeft.day = "00";
                    timeLeft.hour = "00";
                    timeLeft.minute = "00";
                    timeLeft.second = "00";
                } else {
                    //there still is time left, caclulate the difference
                    timeLeft.day = formatTimeValue(Math.floor(timeDiff / secsInDay));
                    timeLeft.hour = formatTimeValue(Math.floor((timeDiff / secsInHour) % 24));
                    timeLeft.minute = formatTimeValue(Math.floor((timeDiff / secsInMin) % 60));
                    timeLeft.second = formatTimeValue(Math.floor(timeDiff % secsInMin));
                }

                //update the time to trigger the renderer in the view
                model.set({remainingTime: timeLeft});
            }, 1000);
        }
    });


    return CountdownModel;
});

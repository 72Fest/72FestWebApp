/*jslint nomen: true */
/*global define*/

define([
    'underscore',
    'backbone',
    'models/PhotoModel'
], function (_, Backbone, PhotoModel) {
    'use strict';

    var PhotosCollection = Backbone.Collection.extend({
        model: PhotoModel,
        url: 'http://localhost:3000/api/photos?callback=?',
        initialize: function () {

            this.fetch({
                success: function (data) {
                    console.log("Recieved photos");
                },
                error: function (e) {
                    console.error("Failed to retrieve photos");
                }
            });
        },
        comparator: function (m1, m2) {
            //we want to sort the collection by timestamp
            var date1 = new Date(m1.get("timestamp")),
                date2 = new Date(m2.get("timestamp"));

            if (date1.getTime() === date2.getTime()) {
                return 0;
            }
            return (date1.getTime() > date2.getTime()) ? -1 : 1;
        },
        parse: function (response) {
            //the expected api response is as follows:
            // {
            //    isSuccess: true | false
            //    message: data | error message
            // }
            var res = JSON.parse(response);
            //console.dir(JSON.parse(res.message));
            if (res.isSuccess) {
                return JSON.parse(res.message);
            } else {
                console.error("Error retreiving photos:" + response.message);
                //silently fail
                return [];
            }
        }
    });

    return PhotosCollection;
});

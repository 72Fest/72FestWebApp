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

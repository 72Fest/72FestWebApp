/*global define*/

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var PhotoModelModel = Backbone.Model.extend({
        url: '',

        initialize: function () {
        },

        idAttribute: '_id',

        defaults: {
            photoUrl: '',
            thumbUrl: ''
        },

        validate: function (attrs, options) {
        },

        parse: function (response, options) {
            return response;
        }
    });

    return PhotoModelModel;
});

/*jslint nomen: true */
/*global define*/

define([
    'underscore',
    'backbone',
    'util/ConfigManager'
], function (_, Backbone, ConfigManager) {
    'use strict';

    var PhotoModelModel = Backbone.Model.extend({
        url: '',

        initialize: function () {
            this.set({baseUrl: ConfigManager.baseAPIURL});
        },

        idAttribute: '_id',

        defaults: {
            photoUrl: '',
            thumbUrl: '',
            baseUrl: ''
        },

        validate: function (attrs, options) {
        },

        parse: function (response, options) {
            return response;
        }
    });

    return PhotoModelModel;
});

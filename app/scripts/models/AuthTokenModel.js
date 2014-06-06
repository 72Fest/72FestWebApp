/*global define*/

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var AuthTokenModel = Backbone.Model.extend({
        initialize: function() {
        },

        defaults: {
            authToken: ''
        },

        validate: function(attrs, options) {
        },

        parse: function(response, options)  {
            return response;
        }
    });

    return AuthTokenModel;
});

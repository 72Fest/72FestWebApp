/*jslint nomen: true */
/*global define*/

define([
    'underscore',
    'backbone',
    'models/AuthTokenModel',
    'localstorage'
], function (_, Backbone, AuthTokenModel) {
    'use strict';

    var AuthTokenCollection = Backbone.Collection.extend({
        model: AuthTokenModel,
        localStorage: new Backbone.LocalStorage("AuthTokenStorage")
    });

    return AuthTokenCollection;
});

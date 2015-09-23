/*jslint nomen: true */
/*global define */
define(['backbone', 'underscore'], function (Backbone, _) {
    "use strict";

    var PhotoEventManager = null;

    (function () {
        PhotoEventManager = _.extend({}, Backbone.Events);

    }());

    return PhotoEventManager;
});

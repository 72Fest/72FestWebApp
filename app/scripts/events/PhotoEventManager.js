/*jslint nomen: true */
/*gloabal define */
define(['backbone', 'underscore'], function (Backbone, _) {
    "use strict";

    var PhotoEventManager = null;

    (function () {
        console.log("ADdddd");
        PhotoEventManager = _.extend({}, Backbone.Events);

    }());

    return PhotoEventManager;
});

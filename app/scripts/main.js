/*global require*/

require.config({
    shim: {
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        },
        handlebars: {
            exports: 'Handlebars'
        }
    },
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        bootstrap: '../bower_components/sass-bootstrap/dist/js/bootstrap',
        handlebars: '../bower_components/handlebars/handlebars',
        ratchet: '../bower_components/ratchet/dist/js/ratchet'
    }
});

require([
    'backbone',
    "jquery",
    "routes/Router",
    "ratchet"
], function (Backbone, $, Router) {
    "use strict";

    //set up router after document is ready
    $(function () {
        var router = new Router();
        Backbone.history.start();
    });

});

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
        ratchet: '../bower_components/ratchet/dist/js/ratchet',
        fastclick: '../bower_components/fastclick/lib/fastclick'
    }
});

require([
    'backbone',
    "jquery",
    "fastclick",
    "routes/Router",
    "ratchet"
], function (Backbone, $, FastClick, Router) {
    "use strict";

    //set up router after document is ready
    $(function () {
        //attach fastclick to body
        FastClick.attach(document.body);

        var router = new Router();
        Backbone.history.start();
    });

});

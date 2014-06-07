/*global require*/

require.config({
    shim: {
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        },
        handlebars: {
            exports: 'Handlebars'
        },
        localstorage: {
            deps: ['backbone']
        },
        backbone: {
            deps: ['underscore'],
            exports: 'Backbone'
        }
    },
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        bootstrap: '../bower_components/sass-bootstrap/dist/js/bootstrap',
        handlebars: '../bower_components/handlebars/handlebars',
        ratchet_segmented_control: '../bower_components/ratchet/js/segmented-controllers',
        fastclick: '../bower_components/fastclick/lib/fastclick',
        text: '../bower_components/requirejs-text/text',
        localstorage: '../bower_components/backbone.localStorage/backbone.localStorage'
    }
});

require([
    'backbone',
    "jquery",
    "fastclick",
    "routes/Router"
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

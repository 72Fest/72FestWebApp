/*jslint nomen: true */
/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates'
], function ($, _, Backbone, JST) {
    'use strict';

    var HomeViewView = Backbone.View.extend({
        template: JST['app/scripts/templates/HomeView.hbs'],

        tagName: 'div',

        id: 'homeView',

        className: '',

        events: {},

        initialize: function () {
            //this.listenTo(this.model, 'change', this.render);
        },

        render: function () {
            this.$el.html(this.template());
        }
    });

    return HomeViewView;
});

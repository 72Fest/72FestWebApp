/*jslint nomen: true */
/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates'
], function ($, _, Backbone, JST) {
    'use strict';

    var TeamsViewView = Backbone.View.extend({
        template: JST['app/scripts/templates/TeamsView.hbs'],

        tagName: 'div',

        id: 'teamsView',

        className: '',

        events: {},

        initialize: function () {
            //this.listenTo(this.model, 'change', this.render);
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });

    return TeamsViewView;
});

/*jslint nomen: true */
/*global define, _ */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/CountdownModel',
    'templates'
], function ($, _, Backbone, CountdownModel, JST) {
    'use strict';

    var CountdownView = Backbone.View.extend({
        template: JST['app/scripts/templates/CountdownView.hbs'],

        tagName: 'div',

        id: 'countdownContainer',

        className: '',

        events: {},

        model: new CountdownModel(),

        initialize: function () {
            //this.listenTo(this.model, 'change', this.render);

        },

        render: function () {
            //console.log("rendering count down view:" + this.$el);
            //TODO: change to cached jquery selector
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        }
    });

    return CountdownView;
});

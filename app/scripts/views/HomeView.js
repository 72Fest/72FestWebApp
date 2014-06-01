/*jslint nomen: true */
/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'views/CountdownView',
    'templates'
], function ($, _, Backbone, CountdownView, JST) {
    'use strict';

    var HomeViewView = Backbone.View.extend({
        template: JST['app/scripts/templates/HomeView.hbs'],

        id: 'homeView',

        tagName: 'div',

        $countdownContainerEl: null,

        className: '',

        events: {},

        countdownView: {},

        initialize: function () {
            //this.listenTo(this.model, 'change', this.render);
            this.countdownView = new CountdownView();

            this.listenTo(this.countdownView.model, "change", this.renderCountdown);
        },

        render: function () {
            //remove cached version of jquery object
            this.$countdownContainerEl = null;
            //populate view and then insert contents of subview
            this.$el.html(this.template());
            this.renderCountdown();

            return this;
        },

        renderCountdown: function (containerEl) {
            var containerEl,
                countdownEl = this.countdownView.render().$el;

            //if there is a cached version of the countdown container
            //set that as the container element to insert the updated
            //html content
            if (this.$countdownContainerEl) {
                containerEl = this.$countdownContainerEl;
            } else {
                //first try and grab container from DOM
                containerEl = $("#countdownContainer");
                if (containerEl.length === 1) {
                    //if found in the DOM, cache the jquery call
                    this.$countdownContainerEl = containerEl;
                } else {
                    //if not found in DOM, just set the current
                    containerEl = this.$el.find("#countdownContainer");
                }
            }

            //populate html container file with updated rendering
            containerEl.html(countdownEl.html());
        }
    });

    return HomeViewView;
});

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

        $countdownEl: '',

        className: '',

        events: {},

        countdownView: {},

        initialize: function () {
            //this.listenTo(this.model, 'change', this.render);
            this.countdownView = new CountdownView();

            this.listenTo(this.countdownView.model, "change", this.renderCountdown);
        },

        render: function () {
            var tmplStr = this.template();
            //populate view and then insert contents of subview
            this.$el.html(this.template());
            tmplStr = this.renderCountdown();


            return this;
        },

        renderCountdown: function () {
            var countdownContainerEl = this.$el.find("#countdownContainer"),
                countdownEl = this.countdownView.render().$el;


            //first render subview and get needed values
            var
                countdownSel;



            //if (!this.$countdownEl) {
                //first render subview and get needed values
                //countdownEl = this.countdownView.$el;
                //countdownSel = "#" + countdownEl.attr("id");

                //this.$countdownEl = this.$el.find(countdownSel);
                countdownContainerEl.html(countdownEl.html());
            //}

        }
    });

    return HomeViewView;
});

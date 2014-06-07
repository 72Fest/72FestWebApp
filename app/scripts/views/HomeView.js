/*jslint nomen: true */
/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'views/CountdownView',
    'collections/AuthTokenCollection',
    'models/AuthTokenModel',
    'templates'
], function ($, _, Backbone, CountdownView, AuthTokenCollection, AuthTokenModel, JST) {
    'use strict';

    var HomeViewView = Backbone.View.extend({
        template: JST['app/scripts/templates/HomeView.hbs'],

        id: 'homeView',

        tagName: 'div',

        $countdownContainerEl: null,

        className: '',

        authCollection: null,

        isAuth: function () {
            this.authCollection.fetch();

            //TODO: make this work with the server
            return (this.authCollection.length > 0) ? true : false;
        },

        events: {},

        countdownView: {},

        initialize: function () {
            var that = this,
                mangageAuth = function (e) {
                    var authModel,
                        userAuthInputVal = $("#authInputKey").val();

                    if (!userAuthInputVal) {
                        alert("Please input auth key!");
                        return;
                    }

                    //stop propogation of click
                    e.preventDefault();

                    if (!that.isAuth()) {
                        authModel = new AuthTokenModel({authToken: userAuthInputVal});

                        that.authCollection.add(authModel);

                        authModel.save();

                        that.render();
                    }

                    //return false to make sure things
                    return false;
                };
            //this.listenTo(this.model, 'change', this.render);
            this.countdownView = new CountdownView();

            this.listenTo(this.countdownView.model, "change", this.renderCountdown);

            //Home screen will stick around so we really
            this.listenTo(this, "ready", function () {

                $("#authForm").submit(mangageAuth);
                $("#cameraBtn").click(function (e) {
                    alert("TODO");
                });
            });

            this.authCollection = new AuthTokenCollection();
            this.authCollection.fetch();


        },

        render: function () {
            var containerEl = $("#homeView");

            //if we couldn't find it in the dom, set container to the $el
            if (containerEl.length === 0) {
                containerEl = this.$el;
            }
            //remove cached version of jquery object
            this.$countdownContainerEl = null;
            //populate view and then insert contents of subview
            containerEl.html(this.template({isAuth: this.isAuth()}));
            this.renderCountdown();

            return this;
        },

        renderCountdown: function () {
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

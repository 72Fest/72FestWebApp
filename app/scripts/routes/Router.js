/*global define, require */

define([
    'jquery',
    'backbone',
    "views/HomeView",
    "views/GalleryView",
    "views/TeamsView"
], function ($, Backbone, HomeView, GalleryView, TeamsView) {
    'use strict';

    var RouterRouter = Backbone.Router.extend({
        contentEl: $("#contentContainer"),
        homeView: null,
        routes: {
            "": "homeHandler",
            "gallery": "galleryHandler",
            "teams": "teamsViewHandler",
            "about": "todoHandler",
            "search": "todoHandler"
        },
        initialize: function() {
            $("a.tab-item").click(function (e) {

                //remove selection state from all tab items
                $("a.tab-item").each(function() {
                    $(this).removeClass("active");
                });

                //apply selection state to current tab item
                $(this).addClass("active");

                //retieve the tab label name
                var tabLabelName = $(this).find(".tab-label").text();
            });
        },
        homeHandler: function () {
            var newContent;
            //we want to keep home view around
            if (this.homeView === null) {
                this.homeView = new HomeView();
            }

            //render the view
            this.homeView.render();

            //get reference to the html
            newContent = this.homeView.$el.html();

            //pass in new content
            this.swapContent(newContent);
        },
        galleryHandler: function () {
            var that = this;
            var newView = new GalleryView();

            that.swapContent(newView.render().$el.html());
        },
        teamsViewHandler: function () {
            var newView = new TeamsView();

            this.swapContent(newView.render().$el.html());
        },
        todoHandler: function () {
            alert("TODO");
        },
        swapContent: function (contentHtml) {
            this.contentEl.html(contentHtml);
        }

    });

    return RouterRouter;
});

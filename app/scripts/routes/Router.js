/*global define, require */

define([
    'jquery',
    'backbone',
    "views/HomeView",
    "views/GalleryView",
    "views/TeamsView",
    "views/SearchView",
    "views/AboutView"
], function ($, Backbone, HomeView, GalleryView, TeamsView, SearchView, AboutView) {
    'use strict';

    var RouterRouter = Backbone.Router.extend({
        contentEl: $("#contentContainer"),
        homeView: null,
        routes: {
            "": "homeHandler",
            "gallery": "galleryHandler",
            "teams": "teamsHandler",
            "about": "aboutHandler",
            "search": "searchHandler"
        },
        tabsMap: {
            "homeHandler": "Home",
            "galleryHandler": "Gallery",
            "teamsHandler": "Teams",
            "aboutHandler": "About",
            "searchHandler": "Search"
        },
        initialize: function () {
            //listen for route event and handle the tab updates
            this.listenTo(this, "route", this.updateTab);
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
            var that = this,
                newView = new GalleryView();

            that.swapContent(newView.render().$el.html());
        },
        teamsHandler: function () {
            var newView = new TeamsView();

            this.swapContent(newView.render().$el.html());
        },
        aboutHandler: function () {
            var newView = new AboutView();

            this.swapContent(newView.render().$el.html());
        },
        searchHandler: function () {
            var newView = new SearchView();

            this.swapContent(newView.render().$el.html());
        },
        swapContent: function (contentHtml) {
            this.contentEl.html(contentHtml);
        },
        updateTab: function (routeName) {
            var tabName = this.tabsMap[routeName],
                curTabItem;

            //remove selection state from all tab items
            $("a.tab-item").each(function () {
                $(this).removeClass("active");
            });

            //if we found a mapping tabname lets move forward
            if (tabName) {
                curTabItem = $("span.tab-label:contains('" + tabName + "')").parent();

                //we found the parent tab item
                if (curTabItem.length === 1) {
                    //apply selection state to current tab item
                    curTabItem.addClass("active");

                }
            } else {
                console.error("Could not find tab name for " + routeName);
            }

        }

    });

    return RouterRouter;
});

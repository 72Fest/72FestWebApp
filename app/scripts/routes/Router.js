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
            //we want to keep home view around
            if (this.homeView === null) {
                this.homeView = new HomeView();
            }

            //render the view
            this.homeView.render();

            //pass in new content
            this.swapContent(this.homeView);
        },
        galleryHandler: function () {
            this.swapContent(new GalleryView());
        },
        teamsHandler: function () {
            this.swapContent(new TeamsView());
        },
        aboutHandler: function () {
            this.swapContent(new AboutView());
        },
        searchHandler: function () {
            this.swapContent(new SearchView());
        },
        swapContent: function (view) {
            //render view and replace content into placeholder
            this.contentEl.html(view.render().$el.html());

            //notify view it is ready for the DOM
            view.trigger("ready", {});
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

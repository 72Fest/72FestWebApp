/*global define, require */

define([
    'jquery',
    'backbone',
    "views/HomeView",
    "views/GalleryView",
    "views/TeamsView",
    "views/SearchView"
], function ($, Backbone, HomeView, GalleryView, TeamsView, SearchView) {
    'use strict';

    var RouterRouter = Backbone.Router.extend({
        contentEl: $("#contentContainer"),
        homeView: null,
        routes: {
            "": "homeHandler",
            "gallery": "galleryHandler",
            "teams": "teamsViewHandler",
            "about": "todoHandler",
            "search": "searchHandler"
        },
        tabsMap: {
            "homeHandler": "Home",
            "galleryHandler": "Gallery",
            "teamsViewHandler": "Teams",
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
        teamsViewHandler: function () {
            var newView = new TeamsView();

            this.swapContent(newView.render().$el.html());
        },
        searchHandler: function () {
            var newView = new SearchView();

            this.swapContent(newView.render().$el.html());
        },
        todoHandler: function () {
            alert("TODO");
        },
        swapContent: function (contentHtml) {
            this.contentEl.html(contentHtml);
        },
        updateTab: function (routeName) {
            var tabName = this.tabsMap[routeName];

            //remove selection state from all tab items
            $("a.tab-item").each(function () {
                $(this).removeClass("active");
            });

            //
            if (tabName) {
                var curTabItem = $("span.tab-label:contains('" + tabName + "')").parent();

                //we found the parent tab item
                if (curTabItem.length === 1) {
                    //apply selection state to current tab item
                    curTabItem.addClass("active");

                }
                console.dir(curTabItem);
            } else {
                console.error("Could not find tab name for " + routeName);
            }

        }

    });

    return RouterRouter;
});

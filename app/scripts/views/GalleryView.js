/*jslint nomen: true */
/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'collections/PhotosCollection',
    'views/PhotoView',
    'templates'
], function ($, _, Backbone, PhotosCollection, PhotoView, JST) {
    'use strict';

    var GalleryView = Backbone.View.extend({
        template: JST['app/scripts/templates/GalleryView.hbs'],

        tagName: 'div',

        id: 'galleryView',

        galleryContainerId: 'galleryViewContainer',

        className: '',

        events: {},

        collection: new PhotosCollection(),

        initialize: function () {
            this.listenTo(this.collection, 'add', this.addPhoto);
        },

        render: function (model) {
            this.$el.html(this.template());
            return this;
        },

        addPhoto: function (m) {
            var containerEl = $("#" + this.galleryContainerId),
                photoView = new PhotoView({model: m});
            containerEl.prepend(photoView.render().$el);
        }
    });

    return GalleryView;
});

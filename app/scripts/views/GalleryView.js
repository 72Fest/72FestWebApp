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
            this.listenTo(this.collection, 'add', function (m) {
                this.addPhoto(m);
            });
        },

        render: function (model) {
            var that = this,
                c; //container to append photos
            this.$el.html(this.template());
            c = this.$el.find("#" + this.galleryContainerId);

            //add all photos to DOM
            //TODO: make this more efficient to write to the DOM only once
            this.collection.each(function (m) {
                console.log("trying to add");
                console.dir(c);
                //supply the container it needs to add to
                that.addPhoto(m, c);
            });
            return this;
        },

        addPhoto: function (m, contEl) {
            var containerEl = contEl || $("#" + this.galleryContainerId),
                photoView = new PhotoView({model: m});
            containerEl.append(photoView.render().$el);
        }
    });

    return GalleryView;
});

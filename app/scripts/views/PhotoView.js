/*jslint nomen: true */
/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'models/PhotoModel',
    'events/PhotoEventManager',
    'templates'
], function ($, _, Backbone, PhotoModel, PhotoEventManager, JST) {
    'use strict';

    var PhotoView = Backbone.View.extend({
        model: PhotoModel,

        template: JST['app/scripts/templates/PhotoView.hbs'],

        tagName: 'div',

        id: '',

        className: 'galleryPhotoContainer',

        events: {
            'click': function (evt) {
                //notify listeners of the PhotoEventManager that a
                //photo was clicked
                PhotoEventManager.trigger("photoClicked", {
                    e: evt
                });
            }
        },

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return PhotoView;
});

/*jslint nomen: true */
/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates'
], function ($, _, Backbone, JST) {
    'use strict';

    var GalleryViewView = Backbone.View.extend({
        template: JST['app/scripts/templates/GalleryView.hbs'],

        tagName: 'div',

        id: 'galleryView',

        className: '',

        events: {},

        initialize: function () {
           // this.listenTo(this.model, 'change', this.render);
        },

        render: function () {
            this.$el.html(this.template());
            return this;
        }
    });

    return GalleryViewView;
});

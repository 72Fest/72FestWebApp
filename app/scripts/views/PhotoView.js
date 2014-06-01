/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'models/PhotoModel',
    'templates'
], function ($, _, Backbone, PhotoModel, JST) {
    'use strict';

    var PhotoView = Backbone.View.extend({
        model: PhotoModel,

        template: JST['app/scripts/templates/PhotoView.hbs'],

        tagName: 'div',

        id: '',

        className: '',

        events: {},

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

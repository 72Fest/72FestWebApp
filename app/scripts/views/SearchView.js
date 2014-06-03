/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates'
], function ($, _, Backbone, JST) {
    'use strict';

    var SearchView = Backbone.View.extend({
        template: JST['app/scripts/templates/SearchView.hbs'],

        tagName: 'div',

        id: 'searchView',

        className: '',

        events: {},

        initialize: function () {
            //this.listenTo(this.model, 'change', this.render);
        },

        render: function () {
            //this.$el.html(this.template(this.model.toJSON()));
            this.$el.html(this.template());

            return this;
        }
    });

    return SearchView;
});

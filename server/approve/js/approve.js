/*global angular, $ */

var app = angular.module('App', []);

app.directive('helloWorld', function () {
    "use strict";
    return {
        restrict: 'AE',
        replace: 'true',
        template: '<h3>Hello World!!</h3>'
    };
});

app.controller("PhotosController", function ($scope,  $timeout, photoService) {
    "use strict";
    console.log("instantiating the photos contorller");

    $scope.$on('photosLoaded', function (evt, args) {
        //activate the lazy load
        $("img.lazy").lazyload({
            effect: "fadeIn"
        });
        $(".imageLink").photoSwipe({captionAndToolbarHide: false, captionAndToolbarShowEmptyCaptions: true});
        Code.PhotoSwipe.attach(window.document.querySelectorAll('.imageLink'), { enableMouseWheel: false, enableKeyboard: false });

        window.scrollTo(0, 10);
    });

    $scope.initPhotos = function () {

        //TODO: fix so we don't need a timeout
        $timeout(function () {
            $scope.$broadcast("photosLoaded");
        }, 500);
    };


    photoService.getPhotos()
        .then(function (data) {
            console.log("We should have data now!!!" + data.message);
            //console.dir(data.message);
            $scope.metadata = data.message.metadata;
            $scope.photos = data.message.photos;
        });
});

app.service("photoService", function ($http, $q) {
    "use strict";

    function handleError(response) {
        console.error("Failed to process request");

        return "failed!";
    }

    function handleSuccess(response) {
        return response.data;
    }

    function getPhotos() {
        var request = $http({
            method: "get",
            url: "/api/photos"
        });

        return (request.then(handleSuccess, handleError));
    }

    return ({
        getPhotos: getPhotos
    });
});

/*global angular, $, $timeout, Code, console, io */

var app = angular.module('App', []);

app.directive('lgPhotoThumb', function ($timeout) {
    "use strict";

    return {
        restrict: 'AE',
        replace: true,
        templateUrl: 'templates/imageThumb.html',
        link: function ($scope, element, attrs) {
            //once the ng-repeat is done, initialize lazy load and photo swipe
            if ($scope.$last === true) {
                $timeout(function () {
                    //activate the lazy load
                    $("img.lazy").lazyload({
                        effect: "fadeIn"
                    });

                    //activate the photo swipe
                    $(".imageLink").photoSwipe({captionAndToolbarHide: false, captionAndToolbarShowEmptyCaptions: true});
                    Code.PhotoSwipe.attach(window.document.querySelectorAll('.imageLink'), {
                        enableMouseWheel: false,
                        enableKeyboard: false
                    });
                });
            }
        }
    };
});

app.controller("PhotosController", function ($scope, photoService) {
    "use strict";

    //set up event listeners
    $("#approvedBtn").click(function () {
        $scope.stateData.showingRejected = false;
        $scope.$digest();
    });

    $("#rejectedBtn").click(function () {
        $scope.stateData.showingRejected = true;
        $scope.$digest();
    });

    //retrieve photos
    $scope.getPhotos = function () {
        photoService.getPhotos()
            .then(function (data) {
                console.log("We should have data now!!!" + data.message);
                //console.dir(data.message);
                $scope.metadata = data.message.metadata;
                $scope.photos = data.message.photos;
            });
    };

    $scope.initSocketIO = function () {
        $scope.socket = io.connect('http://localhost');
        $scope.socket.on('photoRejected', function (data) {
            $scope.getPhotos();
        });
        $scope.socket.on('photoApproved', function (data) {
            //$scope.socket.emit('my other event', { my: 'data' });
            $scope.getPhotos();
        });
        $scope.socket.on('photoUploaded', function (data) {
            $scope.getPhotos();
        });
    };

    //we want to toggle this value on and off
    $scope.stateData = {
        showingRejected: false
    };

    $scope.toggleApproval = function (curPhoto) {
        console.dir(curPhoto.isRejected);

        if (curPhoto.isRejected) {
            $scope.approvePhoto(curPhoto.id);
            curPhoto.isRejected = false;
        } else {
            $scope.rejectPhoto(curPhoto.id);
            curPhoto.isRejected = true;
        }
    };

    $scope.approvePhoto = function (photoId) {
        photoService.approvePhoto(photoId)
            .then(function (data) {
                console.log("got approval data!");
            });
    };

    $scope.rejectPhoto = function (photoId) {
        photoService.rejectPhoto(photoId)
            .then(function (data) {
                console.log("got approval data!");
            });
    };

    //retrieve photos
    $scope.getPhotos();

    //initialize socket io
    $scope.initSocketIO();
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

    function handleApprovalSuccess(response) {
        return response.data;
    }

    function handleApprovalError(response) {
        console.error("Failed to process request");

        return "failed!";
    }

    function getPhotos() {
        var request = $http({
            method: "get",
            url: "/api/photos/all"
        });

        return (request.then(handleSuccess, handleError));
    }

    function approvePhoto(photoId) {
        var request = $http({
            method: "get",
            url: "/api/photo/approve/" + photoId
        });

        return (request.then(handleApprovalSuccess, handleApprovalError));
    }

    function rejectPhoto(photoId) {
        var request = $http({
            method: "get",
            url: "/api/photo/reject/" + photoId
        });

        return (request.then(handleApprovalSuccess, handleApprovalError));
    }

    return ({
        getPhotos: getPhotos,
        approvePhoto: approvePhoto,
        rejectPhoto: rejectPhoto
    });
});

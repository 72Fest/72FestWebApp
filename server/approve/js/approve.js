/*global angular, $, $timeout, Code, console */

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
                    window.scrollTo(0, 10);
                });
            }
        }
    };
});

app.controller("PhotosController", function ($scope, photoService) {
    "use strict";

    //retrieve photos
    photoService.getPhotos()
        .then(function (data) {
            console.log("We should have data now!!!" + data.message);
            //console.dir(data.message);
            $scope.metadata = data.message.metadata;
            $scope.photos = data.message.photos;
        });

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

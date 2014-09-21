/*global angular, $, $timeout */

var app = angular.module('App', []);

app.directive('lgPhotoThumb', function ($timeout) {
    "use strict";

    return {
        restrict: 'AE',
        replace: true,
        templateUrl: 'templates/imageThumb.html',
        link: function ($scope, element, attrs) {
            if ($scope.$last === true) {
                $timeout(function () {
                    //activate the lazy load
                    $("img.lazy").lazyload({
                        effect: "fadeIn"
                    });

                    //activate the photo swipe
                    $(".imageLink").photoSwipe({captionAndToolbarHide: false, captionAndToolbarShowEmptyCaptions: true});
                    Code.PhotoSwipe.attach(window.document.querySelectorAll('.imageLink'), { enableMouseWheel: false, enableKeyboard: false });
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
            url: "/api/photos/all"
        });

        return (request.then(handleSuccess, handleError));
    }

    return ({
        getPhotos: getPhotos
    });
});

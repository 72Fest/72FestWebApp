/*global define */
define(['text!configParams.json'], function (configParams) {
    "use strict";

    var params = JSON.parse(configParams);

    return params;
});

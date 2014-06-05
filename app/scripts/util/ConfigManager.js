/*global define */
define(['text!configParams.json'], function (configParams) {
    var params = JSON.parse(configParams);

    return params;
});

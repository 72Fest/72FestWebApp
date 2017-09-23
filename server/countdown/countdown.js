(function () {
    var form = document.getElementById('countdownForm');

    function sendData() {
        var XHR = new XMLHttpRequest();

        // Bind the FormData object and the form element
        var fd = new FormData(form);

        // reset form
        //form.reset();

        // Define what happens on successful data submission
        XHR.addEventListener('load', function () {
            alert('Successufly sent notification');
        });

        // Define what happens in case of error
        XHR.addEventListener('error', function (err) {
            alert('Oups! Something goes wrong.');
        });

        // Set up our request
        XHR.open('POST', '/api/countDown', true);

        // The data sent is what the user provided in the form
        XHR.send(fd);
    }

    // take over the submit for this form
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // send form data via XHR request
        sendData();
    });
})();

var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});

router.get('/news', function (req, res) {
    //res.sendFile(express.static(path.resolve(path.join(__dirname, 'public/news_feed.html'))));
    res.sendFile(path.resolve(path.join(__dirname, '../public/news_feed.html')));
});
module.exports = router;

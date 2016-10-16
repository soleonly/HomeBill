var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('client', {title: 'clientTest'});
});
router.get('/data', function (req, res, next) {
    res.json({things: "dream"});
});
module.exports = router;

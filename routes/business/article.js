var express = require('express');
var router = express.Router();
var User = require("../../models/User");
var Step = require('../../utils/Step');
var credentials = require('../../credentials');
var reqUtil = require('../../utils/reqUtil');
router.get('/add', function (req, res, next) {
    res.render('business/article/add', {title: '写文章', layout: "layout/contentCol1"});
});

module.exports = router;

/**
 * Created by liuqiangjian on 8/12/2016.
 */
var express = require('express');
var router = express.Router();
var credentials = require('../credentials');
var emailUtil = require("../utils/emailUtil")(credentials);

router.get('/', function(req, res, next) {
    res.render('email', {title: 'emailTest'});
});

router.post('/post', function(req, res, next) {
    var to=req.body.to,subject=req.body.subject,body=req.body.body;
    emailUtil.send(to,subject,body);
    res.json({result: 'success'});
});
module.exports = router;